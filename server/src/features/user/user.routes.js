import express from "express";
import { getAllUsers, deleteUser, updateUserRole } from "./user.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);
router.patch("/:id/role", protect, adminOnly, updateUserRole);

export default router;
