import Song from "../../shared/models/Song.js";
import History from "../../shared/models/history.model.js";

export const registerSongPlay = async (songId, userId) => {
  const song = await Song.findByIdAndUpdate(
    songId,
    { $inc: { plays: 1 } },
    { new: true }
  );

  if (!song) {
    const err = new Error("Không tìm thấy bài hát");
    err.statusCode = 404;
    throw err;
  }

  // Chỉ ghi History nếu đã đăng nhập (History.userId là required)
  if (userId) {
    await History.create({ userId, songId });
  }

  return song;
};