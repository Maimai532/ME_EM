import Album from "../../shared/models/album.model.js";
import Artist from "../../shared/models/artist.model.js";

// GET /api/albums/:id
export const getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artistId", "name avatar")
      .populate("songs");

    if (!album) return res.status(404).json({ message: "Album không tồn tại" });
    res.json(album);
  } catch (err) {
    next(err);
  }
};

// GET /api/albums  (admin hoặc search/gợi ý)
export const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find()
      .populate("artistId", "name avatar")
      .sort({ createdAt: -1 });
    res.json(albums);
  } catch (err) {
    next(err);
  }
};

// POST /api/albums  (admin)
export const createAlbum = async (req, res, next) => {
  try {
    const { title, artistId, coverImage, releaseYear, description, songs } = req.body;

    const album = await Album.create({
      title, artistId, coverImage, releaseYear, description, songs: songs ?? [],
    });

    // Gắn album vào artist
    await Artist.findByIdAndUpdate(artistId, {
      $addToSet: { albums: album._id },
    });

    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/albums/:id  (admin)
export const updateAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!album) return res.status(404).json({ message: "Album không tồn tại" });
    res.json(album);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/albums/:id  (admin)
export const deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: "Album không tồn tại" });

    // Gỡ khỏi artist
    await Artist.findByIdAndUpdate(album.artistId, {
      $pull: { albums: album._id },
    });

    res.json({ message: "Đã xóa album" });
  } catch (err) {
    next(err);
  }
};