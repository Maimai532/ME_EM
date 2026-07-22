import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

import Song from "../src/shared/models/Song.js";

// =====================
// 1. DANH SÁCH GENRE CHUẨN (sau migration)
// =====================
const CANONICAL_GENRES = new Set([
  "Pop", "Rap", "Hip-Hop", "R&B", "Dance-Pop", "Electropop",
  "Pop Ballad", "EDM", "K-Pop", "V-Pop", "Trap", "Dance", "Soul",
  "Electronic", "Synth-Pop", "Alt-Pop", "Indie Pop", "Pop Rock",
  "Alternative Rock", "House", "Dream Pop", "Alternative Pop",
  "Post-Disco", "Rock", "Jazz", "Indie Rock", "Future Bass",
  "Tropical House", "Soft Rock", "Amapiano", "Electro House", "Latin",
  "Jazz Fusion", "Psychedelic Pop", "Reggaeton", "Folk Pop", "Indie",
  "Teen Pop", "Funk", "Nu Metal", "Reggae", "Darkwave", "Dancehall",
  "Hyperpop", "Afrobeats", "Gospel", "Blues", "Techno", "Ballad",
  "Ambient", "Soundtrack", "Classical", "Folk", "Lo-fi", "Other",
]);

// =====================
// 2. MAP TỪNG VARIANT VỀ GENRE CHUẨN
// Key: lowercase của variant, Value: genre chuẩn
// =====================
const GENRE_MAP = {
  // Pop
  "pop": "Pop",
  "global pop": "Pop",
  "retro pop": "Pop",
  "baroque pop": "Pop",
  "experimental pop": "Pop",
  "chamber pop": "Pop",
  "tropical pop": "Pop",
  "orchestral pop": "Pop",
  "vintage pop": "Pop",
  "anti pop": "Pop",
  "french pop": "Pop",
  "pop latin": "Pop",
  "j-pop": "Pop",
  "ambient pop": "Pop",
  "indie ballad": "Pop",
  "stripped-back ballad": "Pop",
  "symphonic pop": "Pop",
  "pop-funk": "Pop",

  // Rap
  "rap": "Rap",
  "melodic rap": "Rap",
  "rap rock": "Rap",
  "pop rap": "Rap",
  "urban hip-hop": "Rap",
  "street hip-hop": "Rap",
  "dark hip-hop": "Rap",
  "electronic hip-hop": "Rap",
  "hip-hop breakbeats": "Rap",
  "rage hip hop": "Rap",
  "k-hip hop": "Rap",
  "alternative hip hop": "Rap",
  "alternative hip-hop": "Rap",

  // Hip-Hop
  "hip hop": "Hip-Hop",
  "hip-hop": "Hip-Hop",
  "hip hop và pop": "Hip-Hop",
  "hip pop": "Hip-Hop",

  // R&B
  "r&b": "R&B",
  "rnb": "R&B",
  "contemporary r&b": "R&B",
  "alternative r&b": "R&B",
  "pb r&b": "R&B",
  "pop r&b": "R&B",
  "trap soul": "R&B",
  "neo-soul": "R&B",

  // Dance-Pop
  "dance-pop": "Dance-Pop",
  "dance pop": "Dance-Pop",
  "teen pop": "Teen Pop",
  "bubblegum pop": "Teen Pop",

  // Electropop
  "electropop": "Electropop",
  "electronica": "Electropop",
  "electropop downtempo": "Electropop",

  // EDM
  "edm": "EDM",

  // K-Pop
  "k-pop": "K-Pop",
  "k pop": "K-Pop",

  // V-Pop
  "v-pop": "V-Pop",
  "v pop": "V-Pop",

  // Trap
  "trap": "Trap",
  "trap-pop": "Trap",

  // Dance
  "dance": "Dance",
  "dancehall": "Dancehall",

  // Soul
  "soul": "Soul",
  "funk": "Funk",
  "disco funk": "Funk",
  "retro funk": "Funk",
  "nu-disco": "Funk",
  "post-disco": "Post-Disco",
  "electro-disco": "Post-Disco",

  // Electronic
  "electronic": "Electronic",
  "dark pop": "Electronic",
  "darkwave": "Darkwave",
  "ambient": "Ambient",
  "ambient house": "Ambient",
  "space lounge": "Ambient",
  "melodic techno": "Techno",
  "techno": "Techno",

  // Synth-Pop
  "synth-pop": "Synth-Pop",
  "synth pop": "Synth-Pop",
  "new wave": "Synth-Pop",
  "synthwave": "Synth-Pop",
  "power pop": "Synth-Pop",

  // Alt-Pop
  "alt-pop": "Alt-Pop",
  "alternative pop": "Alternative Pop",
  "alternative": "Alternative Pop",

  // Indie
  "indie pop": "Indie Pop",
  "indie": "Indie",
  "folktronica": "Indie",
  "folk-pop": "Folk Pop",
  "folk pop": "Folk Pop",

  // Pop Rock
  "pop rock": "Pop Rock",
  "pop-rock": "Pop Rock",
  "emo pop": "Pop Rock",
  "pop-punk": "Pop Rock",

  // Alternative Rock
  "alternative rock": "Alternative Rock",
  "indie rock": "Indie Rock",
  "soft rock": "Soft Rock",
  "hard rock": "Rock",
  "nu metal": "Nu Metal",
  "j-rock": "Rock",
  "rock": "Rock",

  // House
  "house": "House",
  "electro house": "Electro House",
  "tropical house": "Tropical House",
  "uk garage": "House",
  "future bass": "Future Bass",

  // Dream Pop
  "dream pop": "Dream Pop",
  "sadcore": "Dream Pop",

  // Jazz
  "jazz": "Jazz",
  "jazz fusion": "Jazz Fusion",
  "swing": "Jazz",
  "big band": "Jazz",

  // Ballad
  "pop ballad": "Pop Ballad",
  "ballad": "Ballad",

  // Hyperpop
  "hyperpop": "Hyperpop",
  "hyper pop": "Hyperpop",

  // Latin
  "latin": "Latin",
  "latin-pop": "Latin",
  "pop latin": "Latin",
  "afro": "Latin",

  // Jazz / Big Band
  "big band": "Jazz",
  "swing": "Swing",

  // Rock variants
  "electronic rock": "Alternative Rock",
  "indie rock ballad": "Indie Rock",
  "dance-rock": "Rock",
  "j-rock": "Rock",
  "hard rock": "Rock",

  // Trance / Moombahton / Garage → Other (quá lẻ)
  "trance": "Other",
  "moombahton": "Other",
  "garage": "Other",
  "uk garage": "House",
  "country pop": "Other",
  "k-rap": "Rap",

  // Misc
  "reggae": "Reggae",
  "reggaeton": "Reggaeton",
  "afrobeats": "Afrobeats",
  "amapiano": "Amapiano",
  "gospel": "Gospel",
  "blues": "Blues",
  "psychedelic pop": "Psychedelic Pop",
  "anison": "Soundtrack",
  "soundtrack": "Soundtrack",
  "classical crossover": "Classical",
  "teen pop": "Teen Pop",
  "uk drill": "Other",
  "jerk drill": "Other",
  "baltimore club": "Other",
  "baile funk": "Other",
  "brazilian funk": "Other",
  "industrial music": "Other",
  "raw electronic pop": "Other",
};

// =====================
// 3. HÀM TÁCH CHUỖI GENRE
// =====================
function splitRawGenre(str) {
  return str
    .split(/\s+và\s+|,\s*|\/|\\|;|\|/)
    .map((g) => g.trim())
    .filter(Boolean);
}

// =====================
// 4. HÀM MAP 1 GENRE VỀ CHUẨN
// =====================
function mapGenre(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Có trong map → dùng luôn
  if (GENRE_MAP[lower]) return GENRE_MAP[lower];

  // Đã là canonical (case-insensitive) → normalize case
  for (const canonical of CANONICAL_GENRES) {
    if (canonical.toLowerCase() === lower) return canonical;
  }

  // Không nhận ra → Other
  console.log(`  [UNKNOWN] "${trimmed}" → Other`);
  return "Other";
}

// =====================
// 5. HÀM CHUẨN HÓA 1 GENRE STRING
// =====================
function normalizeGenreString(raw) {
  if (!raw || !raw.trim()) return "";

  const parts = splitRawGenre(raw);
  const mapped = parts
    .map(mapGenre)
    .filter(Boolean);

  // Dedup
  const unique = [...new Set(mapped)];
  return unique.join(", ");
}

// =====================
// 6. CHẠY MIGRATION
// =====================
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Kết nối DB thành công\n");

const songs = await Song.find({ genre: { $nin: ["", null] } })
  .select("_id title genre")
  .lean();

console.log(`📦 Tổng số bài có genre: ${songs.length}\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const song of songs) {
  const normalized = normalizeGenreString(song.genre);

  if (normalized === song.genre) {
    skipped++;
    continue;
  }

  try {
    await Song.updateOne({ _id: song._id }, { $set: { genre: normalized } });
    console.log(`✏️  "${song.title}"`);
    console.log(`   Before: ${song.genre}`);
    console.log(`   After:  ${normalized}\n`);
    updated++;
  } catch (err) {
    console.error(`❌ Lỗi "${song.title}": ${err.message}`);
    errors++;
  }
}

console.log("=== KẾT QUẢ ===");
console.log(`✅ Đã cập nhật: ${updated}`);
console.log(`⏭️  Bỏ qua (đã chuẩn): ${skipped}`);
console.log(`❌ Lỗi: ${errors}`);

await mongoose.disconnect();
console.log("\n✅ Xong!");