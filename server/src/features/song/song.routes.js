import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  incrementPlay,
} from "./song.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";
import { uploadSongMedia } from "../../shared/services/cloudinary.service.js";
import Song from "../../shared/models/Song.js";

const router = express.Router();

const uploadFields = (req, res, next) => {
  uploadSongMedia.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error("[songRoutes] uploadFields error:", {
        message: err.message,
        name: err.name,
        code: err.code,
        field: err.field,
      });
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed",
      });
    }
    next();
  });
};

router.get("/", getAllSongs);
router.get("/random", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const songs = await Song.aggregate([{ $sample: { size: limit } }]);
    res.json({ success: true, data: songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/:id", getSongById);
router.post("/", protect, adminOnly, uploadFields, createSong);
router.put("/:id", protect, adminOnly, uploadFields, updateSong);
router.delete("/:id", protect, adminOnly, deleteSong);
router.patch("/:id/play", incrementPlay);

export default router;
