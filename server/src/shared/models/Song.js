import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    artist:     { type: String, required: true, trim: true },
    album:      { type: String, default: "" },
    genre:      { type: String, default: "" },
    duration:   { type: Number, default: 0 },
    sourceType: { type: String, enum: ["url", "upload"], default: "url" },
    plays:      { type: Number, default: 0 },
    artistId:   { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null },

    // URLs (Cloudinary cũ — giữ lại để rollback)
    audioUrl:   { type: String, default: "" },
    imageUrl:   { type: String, default: "" },

    // Keys B2 (mới)
    audioKey:   { type: String, default: null },
    imageKey:   { type: String, default: null },
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);
export default Song;
