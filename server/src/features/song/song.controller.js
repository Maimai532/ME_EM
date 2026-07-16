import Song from "../../shared/models/Song.js";
import Artist from "../../shared/models/artist.model.js";
import Album from "../../shared/models/album.model.js";
import {
  uploadToB2,
  getPresignedUrl,
  deleteFromB2,
} from "../../shared/services/b2.service.js";
import {
  ensureCloudinaryUrl,
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../../shared/services/cloudinary.service.js";
import { registerSongPlay } from "./song.service.js";

export const trackSongPlay = async (req, res) => {
  try {
    const song = await registerSongPlay(req.params.id, req.user?._id);
    res.status(200).json({ plays: song.plays });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Không thể ghi nhận lượt nghe" });
  }
};

export async function resolveAlbumCover(song) {
  if (song.imageUrl) return song.imageUrl;

  if (song.albumId) {
    const album = await Album.findById(song.albumId)
      .select("coverImage")
      .lean();
    if (album?.coverImage) return album.coverImage;
  }

if (song.album?.trim() && song.artistId) {
  const album = await Album.findOne({
    title: { $regex: new RegExp(`^${song.album.trim()}$`, "i") },
    artistId: song.artistId,
  }).select("coverImage").lean();
  if (album?.coverImage) return album.coverImage;
}

  return null;
}

export function parseArtistNames(artistStr) {
  return (artistStr || "")
    .split(/,| và /)
    .map((a) => a.trim())
    .filter(Boolean);
}

async function findOrCreateArtist(name) {
  let artist = await Artist.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (artist) return artist;

  try {
    artist = await Artist.create({ name });
  } catch (e) {
    if (e.code === 11000) {
      artist = await Artist.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
    } else {
      throw e;
    }
  }
  return artist;
}

async function syncArtistLinks(song, oldNames, newNames) {
  const newLower = new Set(newNames.map((n) => n.toLowerCase()));
  const oldLower = new Set(oldNames.map((n) => n.toLowerCase()));

  const removedNames = oldNames.filter((n) => !newLower.has(n.toLowerCase()));
  const addedNames = newNames.filter((n) => !oldLower.has(n.toLowerCase()));

  if (removedNames.length > 0) {
    await Artist.updateMany(
      { name: { $in: removedNames.map((n) => new RegExp(`^${n}$`, "i")) } },
      { $pull: { songs: song._id } },
    );
  }

  for (const name of addedNames) {
    const artist = await findOrCreateArtist(name);
    if (artist) {
      await Artist.updateOne(
        { _id: artist._id },
        { $addToSet: { songs: song._id } },
      );
    }
  }

  let primaryArtistId = null;
  for (const name of newNames) {
    const artist = await Artist.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (artist) {
      primaryArtistId = artist._id;
      break;
    }
  }
  song.artistId = primaryArtistId;
}

async function applyAlbumLink(song, newAlbumId) {
  const current = song.albumId ? String(song.albumId) : null;
  const next = newAlbumId ? String(newAlbumId) : null;
  if (current === next) return next;

  if (current) {
    await Album.updateOne({ _id: current }, { $pull: { songs: song._id } });
  }
  if (next) {
    await Album.updateOne({ _id: next }, { $addToSet: { songs: song._id } });
  }
  return next;
}

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).lean();

    const albumIds = [
      ...new Set(
        songs.filter((s) => s.albumId).map((s) => s.albumId.toString()),
      ),
    ];
    const albums = await Album.find({ _id: { $in: albumIds } })
      .select("coverImage")
      .lean();
    const albumCoverMap = new Map(
      albums.map((a) => [a._id.toString(), a.coverImage]),
    );

    const data = await Promise.all(
      songs.map(async (song) => {
        const streamUrl = song.audioKey
          ? await getPresignedUrl(song.audioKey, 3600)
          : song.audioUrl;

        let coverUrl = song.imageUrl || null;
        if (!coverUrl && song.albumId) {
          coverUrl = albumCoverMap.get(song.albumId.toString()) || null;
        }
        // Fallback hiếm gặp: có tên album (string) nhưng chưa gán albumId
        if (!coverUrl && song.album) {
          coverUrl = await resolveAlbumCover(song);
        }

        return { ...song, streamUrl, coverUrl };
      }),
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài hát" });
    const streamUrl = song.audioKey
      ? await getPresignedUrl(song.audioKey, 3600)
      : song.audioUrl;
    const coverUrl = await resolveAlbumCover(song);
    res.json({
      success: true,
      data: { ...song.toObject(), streamUrl, coverUrl },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;
    if (!title || !artist)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu title hoặc artist" });

    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];
    const manualAudioKey = req.body.audioKey?.trim() || null;

    if (!audioFile && !req.body.audioUrl && !manualAudioKey)
      return res.status(400).json({
        success: false,
        message: "Cần có audio (file, URL, hoặc B2 key)",
      });

    let audioUrl = req.body.audioUrl || null;
    let imageUrl = req.body.imageUrl || null;
    let audioKey = manualAudioKey;
    let imagePublicId = null;
    const sourceType = audioFile ? "upload" : manualAudioKey ? "b2key" : "url";

    if (audioFile) {
      audioKey = await uploadToB2(
        audioFile.buffer,
        audioFile.originalname,
        audioFile.mimetype,
        "audio",
      );
      audioUrl = null;
    } else if (manualAudioKey) {
      audioUrl = null;
    }

    if (imageFile) {
      const result = await uploadBufferToCloudinary(imageFile.buffer, "songs");
      imageUrl = result.url;
      imagePublicId = result.publicId;
    } else if (imageUrl) {
      const result = await ensureCloudinaryUrl(imageUrl, "songs");
      if (result) {
        imageUrl = result.url;
        imagePublicId = result.publicId;
      }
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      duration,
      audioUrl,
      imageUrl,
      audioKey,
      imagePublicId,
      sourceType,
    });

    const artistNames = parseArtistNames(artist);
    for (const artistName of artistNames) {
      const foundArtist = await findOrCreateArtist(artistName);
      if (foundArtist) {
        if (!foundArtist.songs.includes(song._id)) {
          foundArtist.songs.push(song._id);
          await foundArtist.save();
        }
        if (!song.artistId) {
          song.artistId = foundArtist._id;
          await song.save();
        }
      }
    }

    if (req.body.albumId) {
      song.albumId = req.body.albumId;
      await song.save();
      await Album.updateOne(
        { _id: req.body.albumId },
        { $addToSet: { songs: song._id } },
      );
    }

    const streamUrl = song.audioKey
      ? await getPresignedUrl(song.audioKey, 3600)
      : song.audioUrl;
    const coverUrl = await resolveAlbumCover(song);

    res.status(201).json({
      success: true,
      data: { ...song.toObject(), streamUrl, coverUrl },
    });
  } catch (err) {
    console.error("createSong error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

async function isImageShared(publicId, excludeSongId) {
  if (!publicId) return false;
  const usedByOtherSong = await Song.exists({
    _id: { $ne: excludeSongId },
    imagePublicId: publicId,
  });
  if (usedByOtherSong) return true;

  const usedByAlbum = await Album.exists({ coverPublicId: publicId });
  if (usedByAlbum) return true;

  return false;
}

async function safeDeleteImage(publicId, excludeSongId) {
  if (!publicId) return;
  const shared = await isImageShared(publicId, excludeSongId);
  if (shared) {
    console.log(`Bỏ qua xoá ảnh ${publicId} vì đang được dùng chung`);
    return;
  }
  await deleteFromCloudinary(publicId);
}

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài hát" });

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    const oldAudioKey = song.audioKey;
    const oldArtistString = song.artist;

    if (
      req.body.artist !== undefined &&
      req.body.artist.trim() !== (oldArtistString || "").trim()
    ) {
      const oldNames = parseArtistNames(oldArtistString);
      const newNames = parseArtistNames(req.body.artist);
      await syncArtistLinks(song, oldNames, newNames);
      updateData.artistId = song.artistId;
    }

    if (req.body.albumId !== undefined) {
      updateData.albumId = await applyAlbumLink(song, req.body.albumId || null);
    }
    if (req.files?.audio?.[0]) {
      const audioFile = req.files.audio[0];
      const audioKey = await uploadToB2(
        audioFile.buffer,
        audioFile.originalname,
        audioFile.mimetype,
        "audio",
      );
      updateData.audioKey = audioKey;
      updateData.audioUrl = null;
    } else if (req.body.audioUrl) {
      updateData.audioKey = null;
    } else if (
      req.body.audioKey !== undefined &&
      req.body.audioKey !== oldAudioKey
    ) {
      updateData.audioKey = req.body.audioKey || null;
      updateData.audioUrl = null;
    }

    if (req.body.removeImage === "true" && !req.files?.image?.[0]) {
      await safeDeleteImage(song.imagePublicId, song._id);
      updateData.imageUrl = "";
      updateData.imagePublicId = null;
    } else if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      await safeDeleteImage(song.imagePublicId, song._id);
      const result = await uploadBufferToCloudinary(imageFile.buffer, "songs");
      updateData.imageUrl = result.url;
      updateData.imagePublicId = result.publicId;
    } else if (req.body.imageUrl) {
      const result = await ensureCloudinaryUrl(req.body.imageUrl, "songs");
      if (result) {
        await safeDeleteImage(song.imagePublicId, song._id);
        updateData.imageUrl = result.url;
        updateData.imagePublicId = result.publicId;
      } else {
        await safeDeleteImage(song.imagePublicId, song._id);
        updateData.imageUrl = req.body.imageUrl;
        updateData.imagePublicId = null;
      }
    }

    const updated = await Song.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (oldAudioKey && oldAudioKey !== updated.audioKey) {
      await safeDeleteAudio(oldAudioKey, updated._id);
    }

    const streamUrl = updated.audioKey
      ? await getPresignedUrl(updated.audioKey, 3600)
      : updated.audioUrl;
    const coverUrl = await resolveAlbumCover(updated);

    res.json({
      success: true,
      data: { ...updated.toObject(), streamUrl, coverUrl },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });

    if (song.audioKey) await deleteFromB2(song.audioKey);
    if (song.imagePublicId) await deleteFromCloudinary(song.imagePublicId);

    await Artist.updateOne({ _id: song.artistId }, { $pull: { songs: song._id } });
    if (song.albumId) {
      await Album.updateOne({ _id: song.albumId }, { $pull: { songs: song._id } });
    }

    await song.deleteOne();
    res.json({ success: true, message: "Đã xoá bài hát" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const incrementPlay = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true },
    );
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchSongs = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ success: true, data: [] });

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } },
      ],
    })
      .limit(20)
      .lean();

    const albumIds = [
      ...new Set(
        songs.filter((s) => s.albumId).map((s) => s.albumId.toString()),
      ),
    ];
    const albums = await Album.find({ _id: { $in: albumIds } })
      .select("coverImage")
      .lean();
    const albumCoverMap = new Map(
      albums.map((a) => [a._id.toString(), a.coverImage]),
    );

    const data = await Promise.all(
      songs.map(async (song) => {
        const streamUrl = song.audioKey
          ? await getPresignedUrl(song.audioKey, 3600)
          : song.audioUrl;

        let coverUrl = song.imageUrl || null;
        if (!coverUrl && song.albumId) {
          coverUrl = albumCoverMap.get(song.albumId.toString()) || null;
        }
        if (!coverUrl && song.album) {
          coverUrl = await resolveAlbumCover(song);
        }

        return { ...song, streamUrl, coverUrl };
      }),
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    if (!song.audioKey)
      return res.status(400).json({ message: "Song has no audioKey" });
    const url = await getPresignedUrl(song.audioKey);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRandomSongs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const songs = await Song.aggregate([{ $sample: { size: limit } }]);

    const albumIds = [
      ...new Set(
        songs.filter((s) => s.albumId).map((s) => s.albumId.toString()),
      ),
    ];
    const albums = await Album.find({ _id: { $in: albumIds } })
      .select("coverImage")
      .lean();
    const albumCoverMap = new Map(
      albums.map((a) => [a._id.toString(), a.coverImage]),
    );

    const data = await Promise.all(
      songs.map(async (song) => {
        const streamUrl = song.audioKey
          ? await getPresignedUrl(song.audioKey, 3600)
          : song.audioUrl;

        let coverUrl = song.imageUrl || null;
        if (!coverUrl && song.albumId) {
          coverUrl = albumCoverMap.get(song.albumId.toString()) || null;
        }
        if (!coverUrl && song.album) {
          coverUrl = await resolveAlbumCover(song);
        }

        return { ...song, streamUrl, coverUrl };
      }),
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function isAudioShared(audioKey, excludeSongId) {
  if (!audioKey) return false;
  const usedByOtherSong = await Song.exists({
    _id: { $ne: excludeSongId },
    audioKey,
  });
  return !!usedByOtherSong;
}

async function safeDeleteAudio(audioKey, excludeSongId) {
  if (!audioKey) return;
  const shared = await isAudioShared(audioKey, excludeSongId);
  if (shared) {
    console.log(`Bỏ qua xoá audio ${audioKey} vì đang được song khác dùng`);
    return;
  }
  await deleteFromB2(audioKey);
}