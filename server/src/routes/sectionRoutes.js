import express from "express";
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  addSongToSection,
  removeSongFromSection,
} from "../controllers/sectionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllSections);
router.post("/", protect, adminOnly, createSection);
router.put("/:id", protect, adminOnly, updateSection);
router.delete("/:id", protect, adminOnly, deleteSection);
router.post("/:id/songs", protect, adminOnly, addSongToSection);
router.delete("/:id/songs", protect, adminOnly, removeSongFromSection);

export default router;