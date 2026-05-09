import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    artist:   { type: String, required: true },
    album:    { type: String, default: "" },
    genre:    { type: String, default: "" },
    duration: { type: Number, default: 0 },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    plays:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Song", songSchema);