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

    // Lấy URL: ưu tiên file upload, nếu không có thì dùng URL nhập tay
    const audioUrl = req.files?.audio?.[0]?.path || req.body.audioUrl;
    const imageUrl = req.files?.image?.[0]?.path || req.body.imageUrl;

    // Xác định nguồn upload
    const sourceType = req.files?.audio ? "upload" : "url";

    if (!audioUrl) {
      return res.status(400).json({ success: false, message: "Cần có audio (file hoặc URL)" });
    }

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