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
  updateAlbum,
  deleteAlbum,
  removeSongFromArtist,
  syncAllSongsToArtists,
  toggleFollowArtist,
} from "./artist.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";
import { optionalAuth } from "../../shared/middleware/optionalAuth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Static POST routes — đặt TRƯỚC bất kỳ /:id nào
router.post("/sync-songs", syncAllSongsToArtists);

// Public GET
router.get("/", getArtists);
router.get("/:id", optionalAuth, getArtistById);
router.post("/:id/follow", protect, toggleFollowArtist);

// Admin — Artist CRUD
router.post("/", protect, adminOnly, upload.single("avatar"), createArtist);
router.put("/:id", protect, adminOnly, upload.single("avatar"), updateArtist);
router.delete("/:id", protect, adminOnly, deleteArtist);

// Admin — Album
router.post(
  "/:id/albums",
  protect,
  adminOnly,
  upload.single("coverImage"),
  addAlbum,
);
router.put(
  "/:id/albums/:albumId",
  protect,
  adminOnly,
  upload.single("coverImage"),
  updateAlbum,
);
router.delete("/:id/albums/:albumId", protect, adminOnly, deleteAlbum);

// Admin — Songs
router.post("/:id/songs", protect, adminOnly, addSongToArtist);
router.post("/:id/songs/new", protect, adminOnly, createSongForArtist);
router.delete("/:id/songs/:songId", protect, adminOnly, removeSongFromArtist);

export default router;
