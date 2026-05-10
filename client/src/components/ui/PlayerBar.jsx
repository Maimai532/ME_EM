import { Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, VolumeX,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import "../../styles/PlayerBar.css";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlayerBar() {
  const {
    currentSong, isPlaying, currentTime, duration, volume,
    isRepeat, isShuffle,
    togglePlay, playNext, playPrev, seek, changeVolume,
    toggleRepeat, toggleShuffle,
    isPlayerVisible, setIsPlayerVisible,
  } = usePlayer();

  if (!currentSong) return null;

  return (
    <>
      <div className={`player-bar ${!isPlayerVisible ? "player-bar--hidden" : ""}`}>
        {/* Bài đang phát */}
        <div className="player-bar__song">
          <Link to={`/player/${currentSong._id}`}>
            <img
              src={currentSong.imageUrl || "/placeholder.jpg"}
              alt={currentSong.title}
              className="player-bar__thumb"
            />
          </Link>
          <div className="player-bar__info">
            <Link to={`/player/${currentSong._id}`} className="player-bar__title">
              {currentSong.title}
            </Link>
            <span className="player-bar__artist">{currentSong.artist}</span>
          </div>
        </div>

        {/* Controls + Progress */}
        <div className="player-bar__center">
          <div className="player-bar__controls">
            <button className={`player-btn ${isShuffle ? "active" : ""}`} onClick={toggleShuffle}>
              <Shuffle size={18} />
            </button>
            <button className="player-btn" onClick={playPrev}>
              <SkipBack size={20} />
            </button>
            <button className="player-btn player-btn--play" onClick={togglePlay}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="player-btn" onClick={playNext}>
              <SkipForward size={20} />
            </button>
            <button className={`player-btn ${isRepeat ? "active" : ""}`} onClick={toggleRepeat}>
              <Repeat size={18} />
            </button>
          </div>

          <div className="player-bar__progress">
            <span className="player-bar__time">{formatTime(currentTime)}</span>
            <input
              type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="player-bar__seek"
            />
            <span className="player-bar__time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="player-bar__right">
          <button className="player-btn" onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}>
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="player-bar__volume"
          />
        </div>
      </div>

      {/* Nút ẩn/hiện */}
      <button
        className={`player-bar__toggle ${!isPlayerVisible ? "player-bar__toggle--hidden" : ""}`}
        onClick={() => setIsPlayerVisible((v) => !v)}
        title={isPlayerVisible ? "Ẩn player" : "Hiện player"}
      >
        {isPlayerVisible ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </>
  );
}