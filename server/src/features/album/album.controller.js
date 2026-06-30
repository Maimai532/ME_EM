import Album from "../../shared/models/album.model.js";
import Artist from "../../shared/models/artist.model.js";
import {
  ensureCloudinaryUrl,
  deleteFromCloudinary,
} from "../../shared/services/cloudinary.service.js";

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

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artistId, releaseYear, description, songs } = req.body;
    let coverImage = req.body.coverImage || "";
    let coverPublicId = null;

    if (coverImage) {
      const result = await ensureCloudinaryUrl(coverImage, "albums");
      if (result) {
        coverImage = result.url;
        coverPublicId = result.publicId;
      }
    }

    const album = await Album.create({
      title,
      artistId,
      coverImage,
      coverPublicId,
      releaseYear,
      description,
      songs: songs ?? [],
    });

    await Artist.findByIdAndUpdate(artistId, {
      $addToSet: { albums: album._id },
    });

    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
};

export const updateAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album)
      return res.status(404).json({ message: "Album không tồn tại" });

    const updateData = { ...req.body };

    if (req.body.coverImage) {
      const result = await ensureCloudinaryUrl(req.body.coverImage, "albums");
      if (result) {
        if (album.coverPublicId)
          await deleteFromCloudinary(album.coverPublicId);
        updateData.coverImage = result.url;
        updateData.coverPublicId = result.publicId;
      }
    }

    const updated = await Album.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ message: "Album không tồn tại" });

    if (album.coverPublicId) await deleteFromCloudinary(album.coverPublicId);

    await Artist.findByIdAndUpdate(album.artistId, {
      $pull: { albums: album._id },
    });

    res.json({ message: "Đã xóa album" });
  } catch (err) {
    next(err);
  }
};