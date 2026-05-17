import express from "express";
import cors from "cors";

import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/user/user.routes.js";
import songRoutes from "./features/song/song.routes.js";
import sectionRoutes from "./features/section/section.routes.js";
import healthRoutes from "./shared/routes/healthRoutes.js";
import artistRoutes from "./features/artists/artist.routes.js";
import historyRoutes from "./features/history/history.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/songs", songRoutes);
  app.use("/api/sections", sectionRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/artists", artistRoutes);
  app.use("/api/history", historyRoutes);
  
  return app;
}
