import express from "express";
import multer from "multer";
import {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  addSongToArtist,
  createSongForArtist,
  addAlbum,
  deleteAlbum,
  removeSongFromArtist,
  syncAllSongsToArtists,
} from "./artist.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Static POST routes — PHẢI đặt TRƯỚC bất kỳ /:id nào
router.post("/sync-songs", syncAllSongsToArtists);

// Public GET
router.get("/", getArtists);
router.get("/:id", getArtistById);

// Admin — Artist CRUD
router.post("/", protect, adminOnly, upload.single("avatar"), createArtist);
router.put("/:id", protect, adminOnly, upload.single("avatar"), updateArtist);
router.delete("/:id", protect, adminOnly, deleteArtist);

// Admin — Album
router.post("/:id/albums", protect, adminOnly, upload.single("coverImage"), addAlbum);
router.delete("/:id/albums/:albumId", protect, adminOnly, deleteAlbum);

// Admin — Songs
router.post("/:id/songs", protect, adminOnly, addSongToArtist);
router.post("/:id/songs/new", protect, adminOnly, createSongForArtist);
router.delete("/:id/songs/:songId", protect, adminOnly, removeSongFromArtist);

export default router;