//sectionController.js
import Section from "../models/Section.js";

// Lấy tất cả sections (kèm thông tin bài hát)
export const getAllSections = async (req, res) => {
  try {
    const sections = await Section.find({ isVisible: true })
      .sort({ order: 1 })
      .populate("songs"); // lấy đủ thông tin song thay vì chỉ ID
    res.json({ success: true, data: sections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo section mới (admin)
export const createSection = async (req, res) => {
  try {
    const { name, type, description, order } = req.body;
    const section = await Section.create({ name, type, description, order });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sửa section (admin)
export const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ success: false, message: "Không tìm thấy section" });
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xoá section (admin)
export const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá section" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Thêm bài hát vào section (admin)
export const addSongToSection = async (req, res) => {
  try {
    const { songId } = req.body;
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Không tìm thấy section" });

    // Tránh thêm trùng
    if (section.songs.includes(songId)) {
      return res.status(400).json({ success: false, message: "Bài hát đã có trong section này" });
    }

    section.songs.push(songId);
    await section.save();
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xoá bài hát khỏi section (admin)
export const removeSongFromSection = async (req, res) => {
  try {
    const { songId } = req.body;
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: "Không tìm thấy section" });

    section.songs = section.songs.filter(
      (id) => id.toString() !== songId
    );
    await section.save();
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};