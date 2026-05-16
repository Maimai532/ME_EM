import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  coverImage: {
    type: String,
    default: "",  // Cloudinary URL
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
});

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,  // không trùng tên nghệ sĩ
    },
    avatar: {
      type: String,
      default: "",  // Cloudinary URL
    },
    country: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    albums: [albumSchema],
    // songs ngoài album (single, etc.)
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);