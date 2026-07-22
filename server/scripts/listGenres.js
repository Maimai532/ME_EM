import mongoose from "mongoose";
import dotenv from "dotenv";
import Song from "../src/shared/models/Song.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

await mongoose.connect(process.env.MONGO_URI);

const songs = await Song.find({ genre: { $nin: ["", null] } })
  .select("genre")
  .lean();

// Tách tất cả genre ra, normalize sơ bộ
const raw = songs.flatMap((s) =>
  s.genre
    .split(/,|\/|\\|;|\||\band\b|\bvà\b/i)
    .map((g) => g.trim())
    .filter(Boolean)
);

// Đếm tần suất
const freq = {};
for (const g of raw) {
  const key = g.toLowerCase();
  freq[key] = (freq[key] || { count: 0, variants: new Set() });
  freq[key].count++;
  freq[key].variants.add(g);
}

// Sort theo tần suất
const sorted = Object.entries(freq).sort((a, b) => b[1].count - a[1].count);

console.log("\n=== GENRE HIỆN CÓ TRONG DB ===\n");
for (const [key, { count, variants }] of sorted) {
  const variantList = [...variants].join(" | ");
  console.log(`[${count}x]  ${variantList}`);
}

console.log(`\nTổng: ${sorted.length} genre unique`);

await mongoose.disconnect();