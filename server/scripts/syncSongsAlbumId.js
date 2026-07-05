import "dotenv/config";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";
import connectDB from "../src/shared/config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Project đặt .env trong server/ — dotenv/config mặc định chỉ load .env ở cwd (root)
dotenv.config({ path: resolve(__dirname, "../.env") });

const { default: Song } = await import(
  resolve(__dirname, "../src/shared/models/Song.js")
);
const { default: Album } = await import(
  resolve(__dirname, "../src/shared/models/album.model.js")
);

function titleRegex(albumTitle) {
  return { $regex: new RegExp(`^${albumTitle.trim()}$`, "i") };
}

async function sync() {
  await connectDB();

  const songs = await Song.find({ albumId: null, album: { $ne: "" } });
  console.log(`📦 Tìm thấy ${songs.length} bài cần sync albumId`);

  let synced = 0;
  const notFound = [];
  const ambiguous = [];

  for (const song of songs) {
    const titleQuery = titleRegex(song.album);

    if (song.artistId) {
      const album = await Album.findOne({
        title: titleQuery,
        artistId: song.artistId,
      });

      if (album) {
        song.albumId = album._id;
        await song.save();
        synced++;
        console.log(`  ✔ "${song.title}" → album "${album.title}"`);
      } else {
        notFound.push({
          songId: song._id,
          title: song.title,
          album: song.album,
          artist: song.artist,
        });
      }
      continue;
    }

    const matches = await Album.find({ title: titleQuery });

    if (matches.length === 1) {
      song.albumId = matches[0]._id;
      await song.save();
      synced++;
      console.log(`  ✔ "${song.title}" → album "${matches[0].title}"`);
    } else if (matches.length > 1) {
      ambiguous.push({
        songId: song._id,
        title: song.title,
        album: song.album,
        artist: song.artist,
        matchedAlbums: matches.map((a) => ({
          id: a._id,
          title: a.title,
          artistId: a.artistId,
        })),
      });
    } else {
      notFound.push({
        songId: song._id,
        title: song.title,
        album: song.album,
        artist: song.artist,
      });
    }
  }

  console.log("\n🎉 Sync hoàn tất!");
  console.log(`   Đã sync thành công: ${synced}`);
  console.log(`   Không tìm thấy album khớp: ${notFound.length}`);
  console.log(`   Ambiguous (nhiều album trùng tên): ${ambiguous.length}`);

  if (notFound.length) {
    console.log("\n❌ Không tìm thấy album khớp:");
    for (const s of notFound) {
      console.log(
        `   - [${s.songId}] "${s.title}" (album: "${s.album}", artist: "${s.artist}")`,
      );
    }
  }

  if (ambiguous.length) {
    console.log("\n⚠️  Ambiguous — cần xử lý tay (thiếu artistId):");
    for (const s of ambiguous) {
      console.log(
        `   - [${s.songId}] "${s.title}" (album: "${s.album}", artist: "${s.artist}")`,
      );
      for (const a of s.matchedAlbums) {
        console.log(`       → album ${a.id} (artistId: ${a.artistId})`);
      }
    }
  }

  await mongoose.disconnect();
}

sync().catch((err) => {
  console.error("❌ Sync thất bại:", err);
  mongoose.disconnect();
  process.exit(1);
});
