import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // giây, ví dụ 213 = 3:33
      default: 0,
    },
    audioUrl: {
      type: String,
      required: true, // link nhạc (YouTube, SoundCloud, Drive...)
    },
    imageUrl: {
      type: String,
      default: "", // link ảnh bìa
    },
    plays: {
      type: Number,
      default: 0, // đếm lượt nghe
    },
  },
  { timestamps: true } // tự tạo createdAt, updatedAt
);

export default mongoose.model("Song", songSchema);