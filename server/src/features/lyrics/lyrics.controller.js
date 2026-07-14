// lyrics.controller.js
import Song from "../../shared/models/Song.js";
import { fetchLyricsFromLRCLIB } from "./lyrics.service.js";

export async function getLyricsBySongId(req, res, next) {
  try {
    const { songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" });
    }

    if (song.lyrics && song.lyrics.length > 0 && song.isWordLevel === false) {
      console.log("Using cached line-level lyrics");
      return res.status(200).json({ 
        source: "cache", 
        lyrics: song.lyrics,
        isWordLevel: false
      });
    }

    let result;
    try {
      result = await fetchLyricsFromLRCLIB({
        trackName: song.title,
        artistName: song.artist,
        duration: song.duration,
      });
    } catch (fetchErr) {
      console.error("LRCLIB fetch error:", fetchErr.message);
      return res.status(200).json({ 
        source: "none", 
        lyrics: [], 
        message: "Không fetch được lyrics" 
      });
    }

    if (!result || (result.synced.length === 0 && !result.plain)) {
      return res.status(200).json({ 
        source: "none", 
        lyrics: [], 
        message: "Không tìm thấy lyrics" 
      });
    }

    // Lưu lyrics dạng dòng
    const lyricsToSave = result.synced.length > 0
      ? result.synced
      : [{ time: 0, endTime: 3, text: result.plain, isLine: true }];

    try {
      song.lyrics = lyricsToSave;
      song.isWordLevel = false; // Đánh dấu là line-level
      await song.save();
    } catch (saveErr) {
      console.error("Save lyrics error:", saveErr.message);
    }

    return res.status(200).json({ 
      source: "lrclib", 
      lyrics: lyricsToSave,
      isWordLevel: false
    });

  } catch (err) {
    next(err);
  }
}

// API để clear cache cũ
export async function clearLyricsCache(req, res) {
  try {
    const result = await Song.updateMany(
      {}, // Clear tất cả cache để fetch lại dạng line
      { $unset: { lyrics: 1, isWordLevel: 1 } }
    );
    res.json({ 
      message: "Cache cleared successfully",
      modified: result.nModified
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}