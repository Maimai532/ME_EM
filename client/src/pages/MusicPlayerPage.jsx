import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { getRandomSongs } from "../services/songService";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MusicPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Chỉ load danh sách ngẫu nhiên để hiển thị queue
  // KHÔNG gọi playSong ở đây vì SongCard đã gọi rồi
  useEffect(() => {
    async function loadQueue() {
      try {
        const randoms = await getRandomSongs(20);
        setSongList(randoms);
      } catch (err) {
        console.error(err);
      }
    }
    loadQueue();
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Nếu chưa có bài nào đang play thì hiện loading
  if (!currentSong) {
    return (
      <div className="player-page player-page--loading">
        <div className="spinner" />
      </div>
    );
  }

  const song = currentSong;

  return (
    <div className="player-page">
      {/* LEFT */}
      <div className="player-page__left">
        <div className="player-page__cover-wrap">
          <img
            src={song.imageUrl}
            alt={song.title}
            className={`player-page__cover ${isPlaying ? "spinning" : ""}`}
          />
        </div>

        <div className="player-page__meta">
          <h1 className="player-page__title">{song.title}</h1>
          <p className="player-page__artist">{song.artist}</p>
        </div>

        <button
          className={`player-page__like ${liked ? "liked" : ""}`}
          onClick={() => setLiked((v) => !v)}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          {liked ? "Đã thích" : "Yêu thích"}
        </button>

        {/* Progress bar */}
        <div className="player-page__progress">
          <div
            className="player-page__progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
          >
            <div
              className="player-page__progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="player-page__progress-thumb"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="player-page__times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="player-page__controls">
          <button
            className={`ctrl-btn ${isShuffle ? "ctrl-btn--active" : ""}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={22} />
          </button>
          <button className="ctrl-btn" onClick={playPrev}>
            <SkipBack size={26} />
          </button>
          <button className="ctrl-btn ctrl-btn--play" onClick={togglePlay}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button className="ctrl-btn" onClick={playNext}>
            <SkipForward size={26} />
          </button>
          <button
            className={`ctrl-btn ${isRepeat ? "ctrl-btn--active" : ""}`}
            onClick={toggleRepeat}
          >
            <Repeat size={22} />
          </button>
        </div>
      </div>

      {/* RIGHT - Queue */}
      <div className="player-page__right">
        <h2 className="player-page__queue-title">Tiếp theo</h2>
        <div className="player-page__queue">
          {songList
            .filter((s) => s._id !== song._id) // bỏ bài đang phát ra khỏi queue
            .map((s) => (
              <div
                key={s._id}
                className="queue-item"
                onClick={() => {
                  playSong(s, songList);
                  navigate(`/player/${s._id}`);
                }}
              >
                <img src={s.imageUrl} alt={s.title} className="queue-item__thumb" />
                <div className="queue-item__info">
                  <p className="queue-item__title">{s.title}</p>
                  <p className="queue-item__artist">{s.artist}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}