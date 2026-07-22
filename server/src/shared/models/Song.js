import mongoose from "mongoose";
import GENRES from "../constants/genres.js";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, default: "" },
    genre: { type: String, enum: [...GENRES, ""], default: "" },
    duration: { type: Number, default: 0 },
    sourceType: {
      type: String,
      enum: ["b2key", "url", "upload"],
      default: "b2key",
    },
    plays: { type: Number, default: 0 },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      default: null,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },
    // URLs (Cloudinary cũ — giữ lại để rollback)
    audioUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },

    // Keys B2 (mới)
    audioKey: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    lyrics: [
      {
        time: Number,
        text: String,
        isWord: { type: Boolean, default: false },
      },
    ],
    isWordLevel: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Song = mongoose.model("Song", songSchema);
export default Song;
