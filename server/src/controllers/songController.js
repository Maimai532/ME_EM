// songController.js
import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js";

// Lấy tất cả bài hát
export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json({ success: true, data: songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy 1 bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo bài hát mới — hỗ trợ cả URL lẫn upload file
export const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;

    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    // multer-storage-cloudinary trả URL trong path.
    const audioUrl =
      audioFile?.path ||
      audioFile?.secure_url ||
      audioFile?.url ||
      req.body.audioUrl;
    const imageUrl =
      imageFile?.path ||
      imageFile?.secure_url ||
      imageFile?.url ||
      req.body.imageUrl;

    // Xác định nguồn upload
    const sourceType = audioFile ? "upload" : "url";

    if (!audioUrl) {
      return res.status(400).json({ success: false, message: "Cần có audio (file hoặc URL)" });
    }

    if (!title || !artist) {
      return res.status(400).json({ success: false, message: "Thiếu trường bắt buộc: title/artist" });
    }

    // Debug upload pipeline: body + files sau khi qua multer
    console.log("[createSong] body:", req.body);
    console.log(
      "[createSong] files:",
      Object.fromEntries(
        Object.entries(req.files || {}).map(([key, files]) => [
          key,
          files.map((f) => ({
            mimetype: f.mimetype,
            path: f.path,
            secure_url: f.secure_url,
            url: f.url,
            originalname: f.originalname,
          })),
        ])
      )
    );

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      duration,
      audioUrl,
      imageUrl,
      sourceType,
    });

    res.status(201).json({ success: true, data: song });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sửa bài hát
export const updateSong = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Nếu có upload file mới thì ghi đè URL cũ
    if (req.files?.audio?.[0]) {
      updateData.audioUrl = req.files.audio[0].path;
      updateData.sourceType = "upload";
    }
    if (req.files?.image?.[0]) {
      updateData.imageUrl = req.files.image[0].path;
    }

    console.log("[updateSong] body:", req.body);
    console.log(
      "[updateSong] files:",
      Object.fromEntries(
        Object.entries(req.files || {}).map(([key, files]) => [
          key,
          files.map((f) => ({ mimetype: f.mimetype, path: f.path })),
        ])
      )
    );

    const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!song)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });

    res.json({ success: true, data: song });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xoá bài hát — nếu là file upload thì xoá luôn trên Cloudinary
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song)
      return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });

    // Nếu audio được upload lên Cloudinary thì xoá file đó luôn
    if (song.sourceType === "upload" && song.audioUrl) {
      // Lấy public_id từ URL Cloudinary để xoá
      const publicId = song.audioUrl.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    await song.deleteOne();
    res.json({ success: true, message: "Đã xoá bài hát" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tăng lượt nghe
export const incrementPlay = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};