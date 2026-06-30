import { Router } from "express";
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "./album.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);

router.post("/", protect, adminOnly, createAlbum);
router.patch("/:id", protect, adminOnly, updateAlbum);
router.delete("/:id", protect, adminOnly, deleteAlbum);

export default router;