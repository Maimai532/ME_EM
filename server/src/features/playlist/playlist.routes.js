import express from "express";
import { protect } from "../../shared/middleware/authMiddleware.js";
import * as ctrl from "./playlist.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", ctrl.getMyPlaylists);
router.post("/", ctrl.createPlaylist);
router.get("/:id", ctrl.getPlaylistById);
router.post("/:id/songs", ctrl.addSong);
router.delete("/:id/songs/:songId", ctrl.removeSong);
router.delete("/:id", ctrl.deletePlaylist);

export default router;