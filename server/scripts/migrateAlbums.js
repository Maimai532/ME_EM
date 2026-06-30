import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

const AlbumSchema = new mongoose.Schema(
  {
    title: String,
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    coverImage: String,
    releaseYear: Number,
    description: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true, collection: "albums" }
);

const Album = mongoose.model("Album", AlbumSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Dùng raw MongoDB driver — tránh hoàn toàn Mongoose schema conflict
  const db = mongoose.connection.db;
  const artists = await db.collection("artists").find({}).toArray();
  console.log(`📦 Tìm thấy ${artists.length} artists`);

  let totalAlbums = 0;
  let skipped = 0;

  for (const artist of artists) {
    const embeddedAlbums = artist.albums ?? [];

    if (!embeddedAlbums.length) continue;

    // Đã migrate rồi: mỗi phần tử là ObjectId (không có field title)
    const alreadyMigrated = embeddedAlbums.every(
      (a) => !a?.title && mongoose.Types.ObjectId.isValid(a)
    );
    if (alreadyMigrated) {
      console.log(`⏭️  Artist "${artist.name}" đã migrate rồi, bỏ qua`);
      skipped++;
      continue;
    }

    const newAlbumIds = [];

    for (const embedded of embeddedAlbums) {
      if (!embedded?.title) {
        newAlbumIds.push(embedded);
        continue;
      }

      const album = await Album.create({
        title: embedded.title,
        artistId: artist._id,
        coverImage: embedded.coverImage ?? "",
        releaseYear: embedded.releaseYear ?? null,
        description: embedded.description ?? "",
        songs: embedded.songs ?? [],
      });

      newAlbumIds.push(album._id);
      totalAlbums++;
      console.log(`  ✔ Tạo album "${album.title}" cho artist "${artist.name}"`);
    }

    // Cập nhật artist.albums thành array ObjectId
    await db.collection("artists").updateOne(
      { _id: artist._id },
      { $set: { albums: newAlbumIds } }
    );
  }

  console.log("\n🎉 Migration hoàn tất!");
  console.log(`   Albums đã tạo : ${totalAlbums}`);
  console.log(`   Artists bỏ qua: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration thất bại:", err);
  mongoose.disconnect();
  process.exit(1);
});