import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    releaseYear: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  { timestamps: true }
);

const Album = mongoose.model("Album", albumSchema);
export default Album;