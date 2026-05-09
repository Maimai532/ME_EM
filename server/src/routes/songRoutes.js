import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  incrementPlay,
} from "../controllers/songController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadAudio, uploadImage } from "../config/cloudinary.js";
import Song from "../models/Song.js";

const router = express.Router();

// Middleware nhận cả audio lẫn image trong 1 request
const uploadFields = (req, res, next) => {
  uploadAudio.fields([{ name: "audio", maxCount: 1 }])(req, res, (err) => {
    if (err) return next(err);
    uploadImage.fields([{ name: "image", maxCount: 1 }])(req, res, next);
  });
};

router.get("/", getAllSongs);
router.get("/random", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const songs = await Song.aggregate([{ $sample: { size: limit } }]);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/:id", getSongById);
router.post("/", protect, adminOnly, uploadFields, createSong);
router.put("/:id", protect, adminOnly, uploadFields, updateSong);
router.delete("/:id", protect, adminOnly, deleteSong);
router.patch("/:id/play", incrementPlay);

export default router;