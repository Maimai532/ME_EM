import express from "express";
import { addHistory, getHistory, deleteHistory } from "./history.controller.js";
import { protect } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addHistory);
router.get("/", protect, getHistory);
router.delete("/", protect, deleteHistory);

export default router;