import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ─── B2 client (copy thẳng config từ b2.service.js) ──────
const s3 = new S3Client({
  region: "us-east-005",
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

const BUCKET = process.env.B2_BUCKET_NAME;

// ─── Upload buffer lên B2, trả về key ────────────────────
const uploadToB2 = async (buffer, fileName, mimeType, folder) => {
  const key = `${folder}/${Date.now()}-${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return key;
};

// ─── Download file từ URL về buffer ──────────────────────
const downloadFile = async (url) => {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
  });
  return {
    buffer: Buffer.from(res.data),
    contentType: res.headers["content-type"] || "application/octet-stream",
  };
};

// ─── Load Song model trực tiếp ────────────────────────────
// Không import qua feature để tránh circular deps
const songSchema = new mongoose.Schema(
  {
    title:     String,
    artist:    String,
    audioUrl:  String,
    imageUrl:  String,
    audioKey:  { type: String, default: null },
    imageKey:  { type: String, default: null },
    sourceType: String,
  },
  { strict: false } // strict: false để không mất field khác khi save
);

const Song = mongoose.models.Song || mongoose.model("Song", songSchema);

// ─── Migrate songs ────────────────────────────────────────
const migrateSongs = async () => {
  // Chỉ lấy bài có audioUrl chứa cloudinary VÀ chưa có audioKey
  const songs = await Song.find({
    audioUrl: /cloudinary/i,
    audioKey: null,
  });

  console.log(`\n🎵 Tìm thấy ${songs.length} bài cần migrate\n`);

  let success = 0;
  let failed = 0;

  for (const song of songs) {
    try {
      process.stdout.write(`→ "${song.title}" ... `);

      // 1. Migrate audio
      if (song.audioUrl?.includes("cloudinary")) {
        const { buffer } = await downloadFile(song.audioUrl);
        const safeName = song.title.replace(/[^a-zA-Z0-9]/g, "-");
        song.audioKey = await uploadToB2(buffer, `${safeName}.mp3`, "audio/mpeg", "songs/audio");
        song.audioUrl = null; // clear — controller sẽ generate presigned URL
      }

      // 2. Migrate ảnh bìa
      if (song.imageUrl?.includes("cloudinary")) {
        const { buffer, contentType } = await downloadFile(song.imageUrl);
        const ext = song.imageUrl.split(".").pop().split("?")[0] || "jpg";
        song.imageKey = await uploadToB2(
          buffer,
          `cover-${song._id}.${ext}`,
          contentType,
          "songs/covers"
        );
        song.imageUrl = null;
      }

      await song.save();
      success++;
      console.log("✅");
    } catch (err) {
      failed++;
      console.log(`❌ ${err.message}`);
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ Thành công : ${success}`);
  console.log(`❌ Thất bại  : ${failed}`);
  console.log(`─────────────────────────────`);
};

// ─── Main ─────────────────────────────────────────────────
const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    await migrateSongs();

    console.log("\n🎉 Migration hoàn tất!");
  } catch (err) {
    console.error("💥 Lỗi:", err.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();