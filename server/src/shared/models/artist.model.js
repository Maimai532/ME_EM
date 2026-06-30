import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    avatar: { type: String, default: "" },
    avatarKey: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    country: { type: String, default: "" },
    description: { type: String, default: "" },
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true },
);

export default mongoose.model("Artist", artistSchema);
