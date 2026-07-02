import "dotenv/config";
import Artist from "../../shared/models/artist.model.js";
import Song from "../../shared/models/Song.js";
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

const resolveUrl = async (key, fallbackUrl) => {
  if (key) return getPresignedUrl(key, 3600);
  return fallbackUrl || "";
};

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    const data = await Promise.all(
      artists.map(async (a) => ({
        ...a.toObject(),
        avatar: await resolveUrl(a.avatarKey, a.avatar),
      })),
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate("songs")
      .populate({ path: "albums", populate: { path: "songs" } });

    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    // Resolve album cover URLs (same pattern as artist avatar)
    const albumsWithUrls = await Promise.all(
      artist.albums.map(async (album) => ({
        ...album.toObject(),
        coverImage: await resolveUrl(album.coverKey, album.coverImage),
      })),
    );

    res.json({
      ...artist.toObject(),
      avatar: await resolveUrl(artist.avatarKey, artist.avatar),
      albums: albumsWithUrls,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createArtist = async (req, res) => {
  try {
    const { name, country, description } = req.body;
    let avatar = req.body.avatarUrl || "";
    let avatarKey = null;
    let avatarPublicId = null;

    if (req.file) {
      avatarKey = await uploadToB2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "artists",
      );
      avatar = "";
    } else if (avatar) {
      const result = await ensureCloudinaryUrl(avatar, "artists");
      if (result) {
        avatar = result.url;
        avatarPublicId = result.publicId;
      }
    }

    const artist = new Artist({
      name,
      country,
      description,
      avatar,
      avatarKey,
      avatarPublicId,
    });
    await artist.save();

    const matchedSongs = await Song.find({
      artist: {
        $regex: new RegExp(`(^|,\\s*| và )${name}(\\s*,| và |$)`, "i"),
      },
      artistId: null,
    });

    if (matchedSongs.length > 0) {
      const songIds = matchedSongs.map((s) => s._id);
      await Song.updateMany(
        { _id: { $in: songIds } },
        { artistId: artist._id },
      );
      const existingIds = artist.songs.map((s) => s.toString());
      const newIds = songIds.filter(
        (id) => !existingIds.includes(id.toString()),
      );
      if (newIds.length > 0) artist.songs.push(...newIds);
      await artist.save();
    }

    res.status(201).json({ artist, autoLinked: matchedSongs.length });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Tên nghệ sĩ đã tồn tại" });
    res.status(500).json({ message: err.message });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const { name, country, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    if (req.file) {
      if (artist.avatarKey) await deleteFromB2(artist.avatarKey);
      if (artist.avatarPublicId)
        await deleteFromCloudinary(artist.avatarPublicId);

      artist.avatarKey = await uploadToB2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "artists",
      );
      artist.avatar = "";
      artist.avatarPublicId = null;
    } else if (req.body.avatarUrl) {
      const result = await ensureCloudinaryUrl(req.body.avatarUrl, "artists");
      if (result) {
        if (artist.avatarPublicId)
          await deleteFromCloudinary(artist.avatarPublicId);
        artist.avatar = result.url;
        artist.avatarPublicId = result.publicId;
      }
      artist.avatarKey = null;
    }

    if (name) artist.name = name;
    if (country !== undefined) artist.country = country;
    if (description !== undefined) artist.description = description;

    await artist.save();
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    await Song.updateMany({ artistId: artist._id }, { artistId: null });

    try {
      if (artist.avatarKey) await deleteFromB2(artist.avatarKey);
      if (artist.avatarPublicId)
        await deleteFromCloudinary(artist.avatarPublicId);
    } catch (e) {
      console.warn("Không xoá được avatar:", e.message);
    }

    await Artist.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá nghệ sĩ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAlbum = async (req, res) => {
  try {
    const { title, releaseYear, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    let coverImage = req.body.coverImage || "";
    let coverKey = null;
    let coverPublicId = null;

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, "albums");

      coverImage = result.url;
      coverPublicId = result.publicId;
    } else if (coverImage) {
      const result = await ensureCloudinaryUrl(coverImage, "albums");
      if (result) {
        coverImage = result.url;
        coverPublicId = result.publicId;
      }
    }

    const album = await Album.create({
      title,
      artistId: artist._id,
      releaseYear,
      description,
      coverImage,
      coverKey,
      coverPublicId,
    });
    // console.log("req.file:", req.file);
    // console.log("req.body:", req.body);
    artist.albums.push(album._id);
    await artist.save();

    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const album = await Album.findById(req.params.albumId);
    if (!album)
      return res.status(404).json({ message: "Không tìm thấy album" });

    try {
      if (album.coverPublicId) await deleteFromCloudinary(album.coverPublicId);
    } catch (e) {
      console.warn("Không xoá được cover:", e.message);
    }

    await Album.findByIdAndDelete(req.params.albumId);
    artist.albums.pull(req.params.albumId);
    await artist.save();

    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addSongToArtist = async (req, res) => {
  try {
    const { songId, albumId } = req.body;
    const artistId = req.params.id;

    const artist = await Artist.findById(artistId);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const song = await Song.findById(songId);
    if (!song)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });

    if (albumId) {
      await Album.updateOne({ _id: albumId }, { $addToSet: { songs: songId } });
    }
    await Artist.updateOne({ _id: artistId }, { $addToSet: { songs: songId } });

    song.artistId = artist._id;
    await song.save();

    const updated = await Artist.findById(artistId)
      .populate("songs")
      .populate({ path: "albums", populate: { path: "songs" } });

    res.json({ message: "Đã thêm bài hát", artist: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSongForArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const { title, album, genre, duration, audioUrl, imageUrl } = req.body;
    let audioKey = null;
    let imageKey = null;
    let finalImageUrl = imageUrl;
    let imagePublicId = null;

    if (req.files?.audio?.[0]) {
      const f = req.files.audio[0];
      audioKey = await uploadToB2(
        f.buffer,
        f.originalname,
        f.mimetype,
        "audio",
      );
    }
    if (req.files?.image?.[0]) {
      const f = req.files.image[0];
      imageKey = await uploadToB2(
        f.buffer,
        f.originalname,
        f.mimetype,
        "images",
      );
    } else if (imageUrl) {
      const result = await ensureCloudinaryUrl(imageUrl, "songs");
      if (result) {
        finalImageUrl = result.url;
        imagePublicId = result.publicId;
      }
    }

    const song = await Song.create({
      title,
      artist: artist.name,
      artistId: artist._id,
      album,
      genre,
      duration,
      audioUrl: audioKey ? null : audioUrl,
      imageUrl: imageKey ? null : finalImageUrl,
      audioKey,
      imageKey,
      imagePublicId,
      sourceType: audioKey ? "upload" : "url",
    });

    artist.songs.push(song._id);
    await artist.save();

    res.status(201).json({ message: "Đã tạo bài hát", song });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeSongFromArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    artist.songs.pull(req.params.songId);
    await artist.save();

    await Song.findByIdAndUpdate(req.params.songId, { artistId: null });

    res.json({ message: "Đã xoá bài hát khỏi nghệ sĩ", artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const syncAllSongsToArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    const songs = await Song.find();
    let totalLinked = 0;

    for (const artist of artists) {
      const matched = songs.filter((song) => {
        const songArtists =
          song.artist
            ?.split(/,\s*| và |\s*\/\s*/)
            .map((a) => a.trim().toLowerCase())
            .filter(Boolean) || [];
        return songArtists.includes(artist.name.toLowerCase());
      });

      const existingIds = new Set(artist.songs.map((s) => s.toString()));
      const newSongIds = matched
        .map((s) => s._id.toString())
        .filter((id) => !existingIds.has(id));

      if (newSongIds.length > 0) {
        artist.songs.push(...newSongIds);
        artist.songs = [...new Set(artist.songs.map((s) => s.toString()))];
        await artist.save();

        await Song.updateMany(
          { _id: { $in: newSongIds }, artistId: null },
          { artistId: artist._id },
        );
        totalLinked += newSongIds.length;
      }
    }

    res.json({ success: true, message: `Đã sync ${totalLinked} liên kết mới` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
