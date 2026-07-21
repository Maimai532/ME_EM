import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Song from "../src/shared/models/Song.js";
import { splitArtists, joinArtists } from "../src/shared/utils/artistName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/scripts/normalizeArtistNames.js -> server/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Thiếu MONGO_URI trong .env");
  }
  await mongoose.connect(uri);
  console.log("✅ Đã kết nối MongoDB");
}

const isDryRun = process.argv.includes("--dry-run");

async function run() {
  await connectDB();

  const songs = await Song.find({}, { title: 1, artist: 1 });
  console.log(`Tổng số bài hát: ${songs.length}`);
  console.log(
    isDryRun
      ? "🔎 Chế độ DRY-RUN — chỉ in ra, KHÔNG ghi DB\n"
      : "⚠️  Chế độ CHẠY THẬT — sẽ ghi vào DB\n",
  );

  const changes = [];
  for (const song of songs) {
    const before = song.artist || "";
    const after = joinArtists(splitArtists(before));
    if (after !== before) {
      changes.push({ id: song._id, title: song.title, before, after });
    }
  }

  console.log(`Số bài hát cần chuẩn hoá: ${changes.length}\n`);
  changes.forEach((c, i) => {
    console.log(`${i + 1}. [${c.id}] "${c.title}"`);
    console.log(`   trước: "${c.before}"`);
    console.log(`   sau  : "${c.after}"\n`);
  });

  if (isDryRun) {
    console.log("Dry-run hoàn tất. Không có gì được ghi vào DB.");
    console.log("Chạy lại KHÔNG có flag --dry-run để áp dụng thay đổi thật:");
    console.log("  node scripts/normalizeArtistNames.js");
  } else {
    let updated = 0;
    for (const c of changes) {
      await Song.updateOne({ _id: c.id }, { $set: { artist: c.after } });
      updated++;
    }
    console.log(`✅ Đã cập nhật ${updated} bài hát.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Lỗi migration:", err);
  process.exit(1);
});