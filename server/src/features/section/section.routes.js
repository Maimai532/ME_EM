import express from "express";
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  addSongToSection,
  removeSongFromSection,
  addArtistToSection,
  removeArtistFromSection,
} from "./section.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllSections);
router.post("/", protect, adminOnly, createSection);
router.put("/:id", protect, adminOnly, updateSection);
router.delete("/:id", protect, adminOnly, deleteSection);
router.post("/:id/songs", protect, adminOnly, addSongToSection);
router.delete("/:id/songs", protect, adminOnly, removeSongFromSection);
router.post("/:id/artists", protect, adminOnly, addArtistToSection);
router.delete("/:id/artists", protect, adminOnly, removeArtistFromSection);

export default router;
