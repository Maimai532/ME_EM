import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { getRandomSongs } from "../../home/services/songService";
import "../styles/MusicPlayer.css";

export default function MusicPlayer() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, queue, setQueue } = usePlayer();
  const [songList, setSongList] = useState([]);

  // Fetch random songs để làm queue gợi ý
  useEffect(() => {
    async function init() {
      try {
        const randoms = await getRandomSongs(20);
        setSongList(randoms);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  if (!currentSong) return null;

  const displayQueue =
    queue.length > 0
      ? [currentSong, ...queue]
      : [currentSong, ...songList.filter((s) => s._id !== currentSong._id)];

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
          {displayQueue.map((s) => (
            <div
              key={s._id}
              className={`queue-item ${s._id === currentSong._id ? "queue-item--active" : ""}`}
              onClick={() => {
                const newQueue = displayQueue.filter(
                  (item) => item._id !== s._id,
                );

                setQueue(newQueue);

                playSong(s);
              }}
            >
              <img
                src={s.imageUrl || "/placeholder.jpg"}
                alt={s.title}
                className="queue-thumb"
              />
              <div className="queue-info">
                <p
                  className={`queue-item-title ${s._id === currentSong._id ? "queue-item-title--active" : ""}`}
                >
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
