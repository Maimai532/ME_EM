import { Router } from "express";
import { getLyricsBySongId } from "./lyrics.controller.js";

const router = Router();

router.get("/:songId", getLyricsBySongId);

export default router;