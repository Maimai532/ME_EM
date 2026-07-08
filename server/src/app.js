import express from "express";
import cors from "cors";

import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/user/user.routes.js";
import songRoutes from "./features/song/song.routes.js";
import sectionRoutes from "./features/section/section.routes.js";
import healthRoutes from "./shared/routes/healthRoutes.js";
import artistRoutes from "./features/artists/artist.routes.js";
import historyRoutes from "./features/history/history.routes.js";
import playlistRoutes from "./features/playlist/playlist.routes.js";
import aiRoutes from "./features/ai/ai.routes.js";
import albumRoutes from "./features/album/album.routes.js";
import lyricsRoutes from "./features/lyrics/lyrics.routes.js";

export function createApp() {
  const app = express();

/* 
cors() phải đứng đầu:  Browser gửi request → Express kiểm tra CORS ngay lập tức
 Nếu cors() chưa chạy → browser bị block, request không đi tiếp được
 */

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );

  /* 
express.json() phải trước các route :  Request có body (POST/PUT) → express.json() parse body thành req.body
Nếu chưa parse → req.body = undefined → controller đọc không được
 */

  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/songs", songRoutes);
  app.use("/api/sections", sectionRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/artists", artistRoutes);
  app.use("/api/history", historyRoutes);
  app.use("/api/playlists", playlistRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/albums", albumRoutes);
  app.use("/api/lyrics", lyricsRoutes);

  return app;
}
