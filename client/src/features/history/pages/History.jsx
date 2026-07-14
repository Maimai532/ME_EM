import { useHistory } from "../hooks/useHistory";
import { usePlayer } from "../../player/context/PlayerContext";
import { Play, Trash2, Music } from "lucide-react";
import "../styles/History.css";
import { useEffect } from "react";

const FILTERS = [
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày qua", value: "7days" },
  { label: "30 ngày qua", value: "30days" },
];

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, yesterday)) return "Hôm qua";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function groupByDate(histories) {
  const groups = [];
  const map = new Map();

  for (const h of histories) {
    const date = new Date(h.listenedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!map.has(key)) {
      const group = { label: getDayLabel(h.listenedAt), items: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).items.push(h);
  }

  return groups;
}

export default function HistoryPage() {
  const { histories, filter, setFilter, loading, handleDelete } = useHistory();
  const { playSong } = usePlayer();

  // const songs = histories.map((h) => h.songId);
  const groups = groupByDate(histories);
  useEffect(() => {
    document.title = "History";
  }, []);

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

      {loading && <p className="history-page__loading">Đang tải...</p>}
      {!loading && histories.length === 0 && (
        <p className="history-page__empty">Chưa có lịch sử</p>
      )}

      {!loading && (
        <div className="history-page__list">
          {groups.map((group) => (
            <div key={group.label} className="history-page__group">
              <p className="history-page__group-label">{group.label}</p>

              {group.items.map((h) => {
                const song = h.songId;
                if (!song) return null;

                return (
                  <div
                    key={h._id}
                    className="history-page__item"
                    onClick={() => playSong(song, [])}
                  >
                    <div className="history-page__img-wrap">
                      {song.coverUrl || song.imageUrl ? (
                        <img
                          src={song.coverUrl || song.imageUrl}
                          alt={song.title}
                          className="history-page__img"
                        />
                      ) : (
                        <div className="history-page__img history-page__img--placeholder">
                          <Music size={20} />
                        </div>
                      )}
                      <div className="history-page__play-overlay">
                        <Play size={16} fill="white" color="white" />
                      </div>
                    </div>

                    <div className="history-page__info">
                      <p className="history-page__song-title">{song.title}</p>
                      <p className="history-page__artist">{song.artist}</p>
                    </div>

                    <p className="history-page__time">
                      {new Date(h.listenedAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
