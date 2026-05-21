// server/scripts/dedup-artist-songs.js
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ✅ Tự tìm model từ vị trí script — điều chỉnh nếu cần
const { default: Artist } = await import(
    resolve(__dirname, "../src/shared/models/artist.model.js")
);

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) throw new Error("Thiếu MONGO_URI trong .env");

await mongoose.connect(MONGO_URI);
console.log("✅ Đã kết nối MongoDB");

const artists = await Artist.find();
let fixedCount = 0;

for (const artist of artists) {
  const before = artist.songs.length;
  const unique = [...new Set(artist.songs.map((s) => s.toString()))];

  if (unique.length < before) {
    artist.songs = unique;
    await artist.save();
    console.log(`🔧 Fixed "${artist.name}": ${before} → ${unique.length} songs`);
    fixedCount++;
  }
}

console.log(fixedCount === 0 ? "✅ Không có duplicate nào" : `✅ Đã fix ${fixedCount} artists`);
await mongoose.disconnect();
process.exit(0);