import express from "express";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";
import { uploadAvatar } from "../../shared/services/cloudinary.service.js";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getMe,
  updateMe,
  changePassword,
  getLikedSongs,
  likeSong,
  getFollowingArtists,
} from "./user.controller.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.patch("/me", protect, uploadAvatar.single("avatar"), updateMe);

router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);
router.patch("/:id/role", protect, adminOnly, updateUserRole);
router.patch("/me/password", protect, changePassword);
router.get("/liked-songs", protect, getLikedSongs);
router.post("/liked-songs/:songId", protect, likeSong);
router.get("/me/following", protect, getFollowingArtists);
router.get("/me/following-artists", protect, getFollowingArtists);

export default router;
