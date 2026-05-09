import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true },
    avatar:     { type: String, default: "" },
    role:       { type: String, enum: ["user", "admin"], default: "user" },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    playlists:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);