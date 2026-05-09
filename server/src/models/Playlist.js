import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songs:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    imageUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);