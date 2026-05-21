import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import "../styles/MusicPlayer.css";

export default function MusicPlayer() {
  const navigate = useNavigate();
  const { currentSong, playSong, queue, fallbackList } = usePlayer();

  if (!currentSong) return null;

  const displayQueue =
    queue.length > 0
      ? [currentSong, ...queue]
      : [currentSong, ...fallbackList.filter((s) => s._id !== currentSong._id)];

  const dedupedQueue = [
    ...new Map(displayQueue.map((s) => [s._id, s])).values(),
  ];

  return (
    <div className="player-body">
      <div className="player-left">
        <img
          src={currentSong.imageUrl || "/placeholder.jpg"}
          alt={currentSong.title}
          className="player-cover"
        />
        <div className="player-meta">
          <h1 className="player-title">{currentSong.title}</h1>
          <p className="player-artist">{currentSong.artist}</p>
        </div>
      </div>

      <div className="player-right">
        <h2 className="queue-title">Tiếp theo</h2>
        <div className="queue-list">
          {dedupedQueue.map((s) => (
            <div
              key={s._id}
              className={`queue-item ${s._id === currentSong._id ? "queue-item--active" : ""}`}
              onClick={() => playSong(s, dedupedQueue)}
            >
              <img
                src={s.imageUrl || "/placeholder.jpg"}
                alt={s.title}
                className="queue-thumb"
              />
              <div className="queue-info">
                <p className={`queue-item-title ${s._id === currentSong._id ? "queue-item-title--active" : ""}`}>
                  {s.title}
                </p>
                <p className="queue-item-artist">{s.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}