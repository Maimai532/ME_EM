import express from "express";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  incrementPlay,
  searchSongs,
  getRandomSongs,
} from "./song.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";
import { uploadSongMedia } from "../../shared/services/b2.service.js";
import Song from "../../shared/models/Song.js";

const router = express.Router();

const uploadFields = (req, res, next) => {
  uploadSongMedia.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed",
      });
    }
    next();
  });
};

router.get("/", getAllSongs);
router.get("/random", getRandomSongs);
router.get("/search", searchSongs);
router.get("/:id", getSongById);
router.post("/", protect, adminOnly, uploadFields, createSong);
router.put("/:id", protect, adminOnly, uploadFields, updateSong);
router.delete("/:id", protect, adminOnly, deleteSong);
router.patch("/:id/play", incrementPlay);


export default router;