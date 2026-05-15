import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import { getRandomSongs } from "../../home/services/songService";
import { API_URL } from "../../../shared/constants/api";
import "../styles/MusicPlayer.css";

export default function MusicPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, queue } = usePlayer();
  const [songList, setSongList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const randoms = await getRandomSongs(20);
        setSongList(randoms);
        if (!currentSong || currentSong._id !== id) {
          const res = await axios.get(`${API_URL}/songs/${id}`);
          playSong(res.data.data, randoms);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  useEffect(() => {
    if (currentSong && currentSong._id !== id)
      navigate(`/player/${currentSong._id}`, { replace: true });
  }, [currentSong]);

  if (loading) return <div className="player-loading"><div className="spinner" /></div>;
  if (!currentSong) return <div className="player-loading"><p>Không tìm thấy bài hát.</p></div>;

  const displayQueue = queue.length > 0
    ? queue
    : songList.filter((s) => s._id !== currentSong._id);

  return (
    <div className="player-body">
      <div className="player-left">
        <img
          src={currentSong.imageUrl || "/placeholder.jpg"}
          alt={currentSong.title}
          className={`player-cover ${isPlaying ? "" : ""}`}
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
            <div key={s._id} className="queue-item"
              onClick={() => { playSong(s, displayQueue); navigate(`/player/${s._id}`); }}>
              <img src={s.imageUrl || "/placeholder.jpg"} alt={s.title} className="queue-thumb" />
              <div className="queue-info">
                <p className="queue-item-title">{s.title}</p>
                <p className="queue-item-artist">{s.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
