import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
} from "lucide-react";
import Navbar from "../components/ui/Navbar";
import { usePlayer } from "../context/PlayerContext";
import { getRandomSongs } from "../services/songService";
import "../styles/MusicPlayerPage.css";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function MusicPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isRepeat,
    isShuffle,
    togglePlay,
    playNext,
    playPrev,
    seek,
    toggleRepeat,
    toggleShuffle,
    playSong,
  } = usePlayer();

  const [songList, setSongList] = useState([]);
  const [liked, setLiked] = useState(false);
  // Thêm state loading để tránh spinner vô hạn
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // Load queue
        const randoms = await getRandomSongs(20);
        setSongList(randoms);

        // Fix bug 1 & 2:
        // - Luôn fetch bài theo id trên URL
        // - Nếu currentSong đã đúng bài này rồi thì không playSong lại (tránh restart nhạc)
        if (!currentSong || currentSong._id !== id) {
          const res = await axios.get(`http://localhost:8080/api/songs/${id}`);
          const song = res.data.data;
          playSong(song, randoms);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]); // chạy lại mỗi khi id thay đổi (chọn bài khác)

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Chỉ hiện spinner khi đang fetch, không phải khi currentSong chưa sync
  if (loading) {
    return (
      <div className="player-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Sau khi fetch xong mà vẫn không có song thì báo lỗi thay vì loop mãi
  if (!currentSong) {
    return (
      <div className="player-loading">
        <p style={{ color: "white" }}>Không tìm thấy bài hát.</p>
      </div>
    );
  }

  const song = currentSong;

  return (
    <div className="player-page">
      <Navbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />

      {/* TRÁI */}
      <div className="player-left">
        <button className="player-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        <div className="player-cover-wrap">
          <img
            src={song.imageUrl || "/placeholder.jpg"}
            alt={song.title}
            className={`player-cover ${isPlaying ? "spinning" : ""}`}
          />
        </div>

        <div className="player-meta">
          <h1 className="player-title">{song.title}</h1>
          <p className="player-artist">{song.artist}</p>
        </div>

        <button
          className={`player-like ${liked ? "liked" : ""}`}
          onClick={() => setLiked((v) => !v)}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          {liked ? "Đã thích" : "Yêu thích"}
        </button>

        {/* <div className="player-progress">
          <div
            className="player-progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
          >
            <div
              className="player-progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="player-progress-thumb"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="player-times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div> */}

        {/* <div className="player-controls">
          <button
            className={`ctrl-btn ${isShuffle ? "active" : ""}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={22} />
          </button>
          <button className="ctrl-btn" onClick={playPrev}>
            <SkipBack size={26} />
          </button>
          <button className="ctrl-btn ctrl-play" onClick={togglePlay}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button className="ctrl-btn" onClick={playNext}>
            <SkipForward size={26} />
          </button>
          <button
            className={`ctrl-btn ${isRepeat ? "active" : ""}`}
            onClick={toggleRepeat}
          >
            <Repeat size={22} />
          </button>
        </div> */}
      </div>

      {/* PHẢI - Queue */}
      <div className="player-right">
        <h2 className="queue-title">Tiếp theo</h2>
        <div className="queue-list">
          {songList
            .filter((s) => s._id !== song._id)
            .map((s) => (
              <div
                key={s._id}
                className="queue-item"
                onClick={() => {
                  playSong(s, songList);
                  navigate(`/player/${s._id}`);
                }}
              >
                <img
                  src={s.imageUrl || "/placeholder.jpg"}
                  alt={s.title}
                  className="queue-thumb"
                />
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
