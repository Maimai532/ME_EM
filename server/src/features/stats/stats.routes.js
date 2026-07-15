import express from "express";
import { getDashboardStats } from "./stats.controller.js";
import { protect, adminOnly } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);

export default router;