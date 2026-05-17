import { useHistory } from "../hooks/useHistory";
import { usePlayer } from "../../player/context/PlayerContext";
import { Play, Trash2 } from "lucide-react";
import "../styles/History.css";

const FILTERS = [
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày qua", value: "7days" },
  { label: "30 ngày qua", value: "30days" },
];

export default function HistoryPage() {
  const { histories, filter, setFilter, loading, handleDelete } = useHistory();
  const { playSong } = usePlayer();

  // histories là array của { _id, songId: {...}, listenedAt }
  const songs = histories.map((h) => h.songId);

  return (
    <div className="history-page">
      <div className="history-page__header">
        <h2 className="history-page__title">Lịch sử nghe</h2>

        {/* Filter tabs */}
        <div className="history-page__filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`history-page__filter-btn ${filter === f.value ? "active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Nút xoá */}
        <div className="history-page__actions">
          <button
            className="history-page__delete-btn"
            onClick={() => handleDelete("7days")}
          >
            <Trash2 size={14} /> Xoá 7 ngày qua
          </button>
          <button
            className="history-page__delete-btn history-page__delete-btn--danger"
            onClick={() => handleDelete("all")}
          >
            <Trash2 size={14} /> Xoá tất cả
          </button>
        </div>
      </div>

      {/* Danh sách */}
      {loading && <p className="history-page__loading">Đang tải...</p>}

      {!loading && histories.length === 0 && (
        <p className="history-page__empty">Không có lịch sử nào.</p>
      )}

      <div className="history-page__list">
        {histories.map((h) => {
          const song = h.songId;
          if (!song) return null; // phòng trường hợp bài đã bị xoá

          return (
            <div
              key={h._id}
              className="history-page__item"
              onClick={() => playSong(song, songs)}
            >
              <div className="history-page__img-wrap">
                <img
                  src={song.imageUrl || "/placeholder.jpg"}
                  alt={song.title}
                  className="history-page__img"
                />
                <div className="history-page__play-overlay">
                  <Play size={16} fill="white" color="white" />
                </div>
              </div>

              <div className="history-page__info">
                <p className="history-page__song-title">{song.title}</p>
                <p className="history-page__artist">{song.artist}</p>
              </div>

              {/* Time */}
              <p className="history-page__time">
                {new Date(h.listenedAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
