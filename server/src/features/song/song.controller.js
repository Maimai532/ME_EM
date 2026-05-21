import Song from "../../shared/models/Song.js";
import {
  uploadToB2,
  getPresignedUrl,
  deleteFromB2,
} from "../../shared/services/b2.service.js";

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    const data = await Promise.all(
      songs.map(async (song) => {
        const streamUrl = song.audioKey ? await getPresignedUrl(song.audioKey, 3600) : song.audioUrl;
        const imageUrl = song.imageKey ? await getPresignedUrl(song.imageKey, 3600) : song.imageUrl;
        return { ...song.toObject(), streamUrl, imageUrl };
      }),
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });
    const streamUrl = song.audioKey ? await getPresignedUrl(song.audioKey, 3600) : song.audioUrl;
    const imageUrl = song.imageKey ? await getPresignedUrl(song.imageKey, 3600) : song.imageUrl;
    res.json({ success: true, data: { ...song.toObject(), streamUrl, imageUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;
    if (!title || !artist)
      return res.status(400).json({ success: false, message: "Thiếu title hoặc artist" });

    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    if (!audioFile && !req.body.audioUrl)
      return res.status(400).json({ success: false, message: "Cần có audio (file hoặc URL)" });

    let audioUrl = req.body.audioUrl || null;
    let imageUrl = req.body.imageUrl || null;
    let audioKey = null;
    let imageKey = null;
    const sourceType = audioFile ? "upload" : "url";

    if (audioFile) {
      audioKey = await uploadToB2(audioFile.buffer, audioFile.originalname, audioFile.mimetype, "audio");
      audioUrl = null;
    }

    if (imageFile) {
      imageKey = await uploadToB2(imageFile.buffer, imageFile.originalname, imageFile.mimetype, "images");
      imageUrl = null;
    }

    const song = await Song.create({ title, artist, album, genre, duration, audioUrl, imageUrl, audioKey, imageKey, sourceType });
    res.status(201).json({ success: true, data: song });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });

    const updateData = { ...req.body };

    if (req.files?.audio?.[0]) {
      const audioFile = req.files.audio[0];
      const audioKey = await uploadToB2(audioFile.buffer, audioFile.originalname, audioFile.mimetype, "audio");
      updateData.audioKey = audioKey;
      updateData.audioUrl = null;
    } else if (req.body.audioUrl) {
      updateData.audioKey = null; // xoá B2 key, dùng URL ngoài
    }

    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      const imageKey = await uploadToB2(imageFile.buffer, imageFile.originalname, imageFile.mimetype, "images");
      updateData.imageKey = imageKey;
      updateData.imageUrl = null;
    } else if (req.body.imageUrl) {
      updateData.imageKey = null; // xoá B2 key, dùng URL ngoài
    }

    const updated = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Không tìm thấy bài hát" });
    if (song.audioKey) await deleteFromB2(song.audioKey);
    if (song.imageKey) await deleteFromB2(song.imageKey);
    await song.deleteOne();
    res.json({ success: true, message: "Đã xoá bài hát" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const incrementPlay = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchSongs = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ success: true, data: [] });

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { artist: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    const data = await Promise.all(
      songs.map(async (song) => {
        const streamUrl = song.audioKey ? await getPresignedUrl(song.audioKey, 3600) : song.audioUrl;
        const imageUrl = song.imageKey ? await getPresignedUrl(song.imageKey, 3600) : song.imageUrl;
        return { ...song.toObject(), streamUrl, imageUrl };
      }),
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    if (!song.audioKey) return res.status(400).json({ message: "Song has no audioKey" });
    const url = await getPresignedUrl(song.audioKey);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};