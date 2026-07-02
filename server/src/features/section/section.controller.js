//sectionController.js
import Section from "../../shared/models/Section.js";
import { resolveAlbumCover } from "../song/song.controller.js"; 

// Lấy tất cả sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await Section.find({ isVisible: true }).sort({ order: 1 });

    const populated = await Promise.all(
      sections.map(async (section) => {
        if (section.type === "artist") {
          return section.populate("artists");
        }
        await section.populate("songs");

        // Tính coverUrl cho từng song (fallback về ảnh album nếu song không có ảnh riêng)
        const songsWithCover = await Promise.all(
          section.songs.map(async (song) => {
            const coverUrl = await resolveAlbumCover(song);
            return { ...song.toObject(), coverUrl };
          }),
        );

        const sectionObj = section.toObject();
        sectionObj.songs = songsWithCover;
        return sectionObj;
      })
    );

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo section mới 
export const createSection = async (req, res) => {
  try {
    const { name, type, description, order, layout } = req.body;
    const section = await Section.create({ name, type, description, order, layout });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sửa section 
export const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ success: false, message: "Không tìm thấy section" });
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xoá section
export const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá section" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Thêm bài hát vào section
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

// Xoá bài hát khỏi section 
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

export const addArtistToSection = async (req, res) => {
  try {
    const { artistId } = req.body
    const section = await Section.findById(req.params.id)
    if (!section) return res.status(404).json({ success: false, message: 'Không tìm thấy section' })

    if (section.artists.includes(artistId)) {
      return res.status(400).json({ success: false, message: 'Nghệ sĩ đã có trong section' })
    }

    section.artists.push(artistId)
    await section.save()
    res.json({ success: true, data: section })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export const removeArtistFromSection = async (req, res) => {
  try {
    const { artistId } = req.body
    const section = await Section.findById(req.params.id)
    if (!section) return res.status(404).json({ success: false, message: 'Không tìm thấy section' })

    section.artists = section.artists.filter(id => id.toString() !== artistId)
    await section.save()
    res.json({ success: true, data: section })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}


