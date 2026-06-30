import "dotenv/config";
import mongoose from "mongoose";
import Artist from "../src/shared/models/artist.model.js";
import Album from "../src/shared/models/album.model.js";
import Song from "../src/shared/models/Song.js";
import {
  ensureCloudinaryUrl,
  isCloudinaryUrl,
} from "../src/shared/services/cloudinary.service.js";

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Artist avatar ──
  const artists = await Artist.find({
    avatar: { $exists: true, $ne: "" },
  });
  let artistCount = 0;
  for (const artist of artists) {
    if (isCloudinaryUrl(artist.avatar)) continue;
    const newUrl = await ensureCloudinaryUrl(artist.avatar, "artists");
    if (newUrl !== artist.avatar) {
      artist.avatar = newUrl;
      await artist.save();
      artistCount++;
      console.log(`  ✔ Artist "${artist.name}" → ${newUrl}`);
    }
  }

  // ── Album coverImage (nếu Album là collection riêng) ──
  const albums = await Album.find({
    coverImage: { $exists: true, $ne: "" },
  });
  let albumCount = 0;
  for (const album of albums) {
    if (isCloudinaryUrl(album.coverImage)) continue;
    const newUrl = await ensureCloudinaryUrl(album.coverImage, "albums");
    if (newUrl !== album.coverImage) {
      album.coverImage = newUrl;
      await album.save();
      albumCount++;
      console.log(`  ✔ Album "${album.title}" → ${newUrl}`);
    }
  }

  // ── Song imageUrl ──
  const songs = await Song.find({
    imageUrl: { $exists: true, $ne: "" },
    imageKey: null, // chỉ xử lý song dùng URL, không đụng song đang dùng B2 key
  });
  let songCount = 0;
  for (const song of songs) {
    if (isCloudinaryUrl(song.imageUrl)) continue; // đã ở cloud rồi → bỏ qua
    const newUrl = await ensureCloudinaryUrl(song.imageUrl, "songs");
    if (newUrl !== song.imageUrl) {
      song.imageUrl = newUrl;
      await song.save();
      songCount++;
      console.log(`  ✔ Song "${song.title}" → ${newUrl}`);
    }
  }
  console.log(
    `\n🎉 Migrate xong: ${artistCount} artist avatar, ${albumCount} album cover, ${songCount} song image`,
  );

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration thất bại:", err);
  mongoose.disconnect();
  process.exit(1);
});
