import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  coverImage:  { type: String, default: "" },  // giữ lại để fallback / rollback
  coverKey:    { type: String, default: null }, // ← B2 key mới
  releaseYear: { type: Number, default: null },
  description: { type: String, default: "" },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
});

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    avatar:    { type: String, default: "" },   // giữ lại để fallback / rollback
    avatarKey: { type: String, default: null }, // ← B2 key mới
    country:     { type: String, default: "" },
    description: { type: String, default: "" },
    albums: [albumSchema],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);