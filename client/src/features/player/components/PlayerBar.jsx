import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../../../shared/utils/formatTime";
import "../styles/PlayerBar.css";
import { ListPlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import AddToPlaylistModal from "../../playlist/components/AddToPlaylistModal";

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeat,
    isShuffle,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleRepeat,
    toggleShuffle,
    isPlayerVisible,
    setIsPlayerVisible,
    setIsMusicPlayerVisible,
    toggleMute,
  } = usePlayer();
  const { likedSongs, toggleLike } = useAuth();
  const isLiked = likedSongs.some((s) => s._id === currentSong?._id);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  if (!currentSong) return null;

  return (
    <>
      <div
        className={`player-bar ${!isPlayerVisible ? "player-bar--hidden" : ""}`}
        // onClick={() => setIsMusicPlayerVisible((v) => !v)}
      >
        {/* Bài đang phát */}
        <div
          className="player-bar__song"
          onClick={() => setIsMusicPlayerVisible((v) => !v)}
          style={{ cursor: "pointer" }}
        >
          <img
            src={currentSong.imageUrl || "/placeholder.jpg"}
            alt={currentSong.title}
            className="player-bar__thumb"
          />
          <div className="player-bar__info">
            <p className="player-bar__title">{currentSong.title}</p>
            <span className="player-bar__artist">{currentSong.artist}</span>
          </div>
        </div>

        {/* Controls + Progress */}
        <div className="player-bar__center">
          <div className="player-bar__progress">
            <span className="player-bar__time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="player-bar__seek"
              style={{
                background: `linear-gradient(to right, 
              #68c6ed ${(currentTime / (duration || 1)) * 100}%, 
              rgba(255,255,255,0.15) ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
            <span className="player-bar__time">{formatTime(duration)}</span>
          </div>

          <div className="player-bar__controls">
            <button
              className={`player-btn ${isShuffle ? "active" : ""}`}
              onClick={toggleShuffle}
            >
              <Shuffle size={18} />
            </button>
            <button className="player-btn" onClick={playPrev}>
              <SkipBack size={20} />
            </button>
            <button
              className="player-btn player-btn--play"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="player-btn" onClick={playNext}>
              <SkipForward size={20} />
            </button>
            <button
              className={`player-btn ${isRepeat ? "active" : ""}`}
              onClick={toggleRepeat}
            >
              <Repeat size={18} />
            </button>
          </div>
        </div>

        {/* Volume */}
        <div className="player-bar__right">
          <button
            className="player-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="player-bar__volume"
            style={{
              background: `linear-gradient(to right, 
            #68c6ed ${volume * 100}%, 
            rgba(255,255,255,0.15) ${volume * 100}%)`,
            }}
          />
          <button
            className={`player-btn ${isLiked ? "player-btn--liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentSong._id);
            }}
            title={isLiked ? "Bỏ thích" : "Yêu thích"}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button
            className="player-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistModal(true);
            }}
            title="Thêm vào playlist"
          >
            <ListPlus size={18} />
          </button>
          {showPlaylistModal && currentSong && (
            <AddToPlaylistModal
              song={currentSong}
              onClose={() => setShowPlaylistModal(false)}
            />
          )}
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
