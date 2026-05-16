import Artist from "../../shared/models/artist.model.js";
import Song from "../../shared/models/Song.js";
import cloudinary from "../../shared/services/cloudinary.service.js";

// ─── Helper upload buffer lên Cloudinary ─────────────────
const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `me_em/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// ─── Helper xóa ảnh trên Cloudinary ──────────────────────
const deleteFromCloud = (url) => {
  if (!url) return Promise.resolve();
  const parts = url.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${filename}`;
  return cloudinary.uploader.destroy(publicId);
};

// ─── Lấy danh sách artist ─────────────────────────────────
export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.json(artists);  // ← xóa hết code thừa, chỉ giữ lại đây
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
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Tạo artist mới ───────────────────────────────────────
export const createArtist = async (req, res) => {
  try {
    console.log("body:", req.body); 
    console.log("file:", req.file);
    const { name, country, description } = req.body;
    let avatarUrl = "";

    if (req.file) {
      avatarUrl = await uploadBuffer(req.file.buffer, "artists");
    } else if (req.body.avatarUrl) {
      avatarUrl = req.body.avatarUrl;  // ← thêm
    }

    const artist = new Artist({ name, country, description, avatar: avatarUrl });
    await artist.save();

    const matchedSongs = await Song.find({
      artist: { $regex: new RegExp(`^${name}$`, "i") },
      artistId: null,
    });

    if (matchedSongs.length > 0) {
      const songIds = matchedSongs.map((s) => s._id);
      await Song.updateMany({ _id: { $in: songIds } }, { artistId: artist._id });
      artist.songs = songIds;
      await artist.save();
    }

    res.status(201).json({ artist, autoLinked: matchedSongs.length });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Tên nghệ sĩ đã tồn tại" });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─── Cập nhật artist ──────────────────────────────────────
export const updateArtist = async (req, res) => {
  try {
    const { name, country, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    if (req.file) {
      await deleteFromCloud(artist.avatar);
      artist.avatar = await uploadBuffer(req.file.buffer, "artists");
    } else if (req.body.avatarUrl) {
      artist.avatar = req.body.avatarUrl;  // ← thêm
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
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    await Song.updateMany({ artistId: artist._id }, { artistId: null });

    // Bọc deleteFromCloud trong try-catch riêng, lỗi cloud không làm crash
    try {
      await deleteFromCloud(artist.avatar);
    } catch (cloudErr) {
      console.warn("Không xóa được ảnh cloud:", cloudErr.message);
    }

    await Artist.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa nghệ sĩ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Thêm song có sẵn vào artist ─────────────────────────
export const addSongToArtist = async (req, res) => {
  try {
    const { songId, albumId } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    song.artistId = artist._id;
    await song.save();

    if (albumId) {
      const album = artist.albums.id(albumId);
      if (album && !album.songs.includes(songId)) {
        album.songs.push(songId);
      }
    }

    if (!artist.songs.includes(songId)) {
      artist.songs.push(songId);
    }

    await artist.save();
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Tạo song mới và thêm vào artist ─────────────────────
export const createSongForArtist = async (req, res) => {
  try {
    const { title, album, genre, duration, audioUrl, imageUrl, sourceType, albumId } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const song = new Song({
      title,
      artist: artist.name,
      artistId: artist._id,
      album: album || "",
      genre: genre || "",
      duration: duration || 0,
      audioUrl,
      imageUrl: imageUrl || "",
      sourceType: sourceType || "url",
    });

    await song.save();

    if (albumId) {
      const albumDoc = artist.albums.id(albumId);
      if (albumDoc) albumDoc.songs.push(song._id);
    }

    artist.songs.push(song._id);
    await artist.save();

    res.status(201).json({ song, artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Thêm album vào artist ────────────────────────────────
export const addAlbum = async (req, res) => {
  try {
    const { title, releaseYear, description } = req.body;
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    let coverImage = "";
    if (req.file) {
      coverImage = await uploadBuffer(req.file.buffer, "albums");
    } else if (req.body.coverImage) {   // ← thêm fallback URL
      coverImage = req.body.coverImage;
    }

    artist.albums.push({ title, releaseYear, description, coverImage });
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
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    const album = artist.albums.id(req.params.albumId);
    if (!album) return res.status(404).json({ message: "Không tìm thấy album" });

    await deleteFromCloud(album.coverImage);
    artist.albums.pull(req.params.albumId);
    await artist.save();

    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Gỡ song khỏi artist ─────────────────────────────────
export const removeSongFromArtist = async (req, res) => {
  try {
    const { songId } = req.params;
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

    artist.songs.pull(songId);
    artist.albums.forEach((album) => album.songs.pull(songId));
    await artist.save();

    await Song.findByIdAndUpdate(songId, { artistId: null });

    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};