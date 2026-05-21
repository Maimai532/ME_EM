import "dotenv/config";
import Artist from "../../shared/models/artist.model.js";
import Song from "../../shared/models/Song.js";
import {
  uploadToB2,
  getPresignedUrl,
  deleteFromB2,
} from "../../shared/services/b2.service.js";

// ─── Helper: lấy URL hiển thị (generate nếu là B2 key) ───
const resolveUrl = async (key, fallbackUrl) => {
  if (key) return getPresignedUrl(key, 3600);
  return fallbackUrl || "";
};

// ─── Lấy danh sách artist ─────────────────────────────────
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

// ─── Lấy 1 artist + populate songs ───────────────────────
export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate("songs")
      .populate("albums.songs");
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    res.json({
      ...artist.toObject(),
      avatar: await resolveUrl(artist.avatarKey, artist.avatar),
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

    if (req.file) {
      avatarKey = await uploadToB2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "artists",
      );
      avatar = ""; // không lưu URL, chỉ lưu key
    }

    const artist = new Artist({
      name,
      country,
      description,
      avatar,
      avatarKey,
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
      //push những cái chưa có
      const existingIds = artist.songs.map((s) => s.toString());
      const newIds = songIds.filter(
        (id) => !existingIds.includes(id.toString()),
      );

      if (newIds.length > 0) {
        artist.songs.push(...newIds);
      }
      await artist.save();
    }

    res.status(201).json({ artist, autoLinked: matchedSongs.length });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Tên nghệ sĩ đã tồn tại" });
    res.status(500).json({ message: err.message });
  }
};

// ─── Cập nhật artist ──────────────────────────────────────
export const updateArtist = async (req, res) => {
  try {
    const { name, country, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    if (req.file) {
      // Xoá ảnh cũ trên B2 nếu có
      if (artist.avatarKey) await deleteFromB2(artist.avatarKey);

      artist.avatarKey = await uploadToB2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "artists",
      );
      artist.avatar = "";
    } else if (req.body.avatarUrl) {
      artist.avatar = req.body.avatarUrl;
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

// ─── Xóa artist ───────────────────────────────────────────
export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    await Song.updateMany({ artistId: artist._id }, { artistId: null });

    try {
      if (artist.avatarKey) await deleteFromB2(artist.avatarKey);
    } catch (e) {
      console.warn("Không xoá được avatar B2:", e.message);
    }

    await Artist.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá nghệ sĩ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Thêm album vào artist ────────────────────────────────
export const addAlbum = async (req, res) => {
  try {
    const { title, releaseYear, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    let coverImage = req.body.coverImage || "";
    let coverKey = null;

    if (req.file) {
      coverKey = await uploadToB2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "albums",
      );
      coverImage = "";
    }

    artist.albums.push({
      title,
      releaseYear,
      description,
      coverImage,
      coverKey,
    });
    await artist.save();

    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Xóa album khỏi artist ───────────────────────────────
export const deleteAlbum = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const album = artist.albums.id(req.params.albumId);
    if (!album)
      return res.status(404).json({ message: "Không tìm thấy album" });

    try {
      if (album.coverKey) await deleteFromB2(album.coverKey);
    } catch (e) {
      console.warn("Không xoá được cover B2:", e.message);
    }

    artist.albums.pull(req.params.albumId);
    await artist.save();

    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Thêm song có sẵn vào artist ─────────────────────────
export const addSongToArtist = async (req, res) => {
  try {
    const { songId } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const song = await Song.findById(songId);
    if (!song)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });

    // So sánh string để tránh ObjectId mismatch
    const alreadyLinked = artist.songs.some(
      (s) => s.toString() === songId.toString(),
    );
    if (!alreadyLinked) {
      artist.songs.push(songId);
      await artist.save();
    }

    song.artistId = artist._id;
    await song.save();

    res.json({
      message: alreadyLinked
        ? "Bài hát đã có trong danh sách"
        : "Đã thêm bài hát vào nghệ sĩ",
      artist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Tạo song mới gắn luôn vào artist ────────────────────
export const createSongForArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const { title, album, genre, duration, audioUrl, imageUrl } = req.body;
    let audioKey = null;
    let imageKey = null;

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
    }

    const song = await Song.create({
      title,
      artist: artist.name,
      artistId: artist._id,
      album,
      genre,
      duration,
      audioUrl: audioKey ? null : audioUrl,
      imageUrl: imageKey ? null : imageUrl,
      audioKey,
      imageKey,
      sourceType: audioKey ? "upload" : "url",
    });

    artist.songs.push(song._id);
    await artist.save();

    res.status(201).json({ message: "Đã tạo bài hát", song });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Xoá song khỏi artist ────────────────────────────────
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

// ─── Sync tất cả songs vào đúng artist ───────────────────
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

      // existingIds dùng Set để lookup O(1)
      const existingIds = new Set(artist.songs.map((s) => s.toString()));
      const newSongIds = matched
        .map((s) => s._id.toString())
        .filter((id) => !existingIds.has(id));

      if (newSongIds.length > 0) {
        artist.songs.push(...newSongIds);

        // Dedup phòng trường hợp DB đã có duplicate từ trước
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
