import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    layout: {
      type: String,
      enum: ["scroll", "grid", "list"],
      default: "scroll",
    },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    type: { type: String, enum: ["song", "artist"], default: "song" },
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
  },
  { timestamps: true },
);

export default mongoose.model("Section", sectionSchema);
