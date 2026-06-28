import { Play, Heart, ListPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SongCard.css";
import { usePlayer } from "../../player/context/PlayerContext";
import AddToPlaylistModal from "../../playlist/components/AddToPlaylistModal";
import { useAuth } from "../../auth/hooks/useAuth";

function SongCard({ song, songList = [], layout = "scroll" }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { likedSongs, toggleLike } = useAuth();
  const isLiked = likedSongs.some((s) => s._id === song._id);

  if (!song) return null;

  function handlePlay(e) {
    e?.stopPropagation();
    playSong(song, songList);
    // navigate(`/player/${song._id}`);
  }

  function handleLike(e) {
    e.stopPropagation();
    setLiked(!liked);
  }

  function handleLike(e) {
    e.stopPropagation();
    toggleLike(song._id);
  }

  function handleAddToPlaylist(e) {
    e.stopPropagation();
    setShowPlaylistModal(true);
  }

  if (layout === "scroll") {
    return (
      <div
        className="song-card song-card--scroll"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handlePlay}
      >
        <div className="song-card__cover-wrap">
          <img
            src={song.imageUrl || "/placeholder.jpg"}
            alt={song.title}
            className="song-card__img"
          />
          {hovered && (
            <button
              type="button"
              className="song-card__play-btn"
              onClick={handlePlay}
            >
              <Play size={16} fill="white" color="white" />
            </button>
          )}
        </div>
        <div className="song-card__info">
          <p className="song-card__title" title={song.title}>
            {song.title}
          </p>
          <p className="song-card__artist">{song.artist}</p>
        </div>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div
        className="song-card song-card--grid"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handlePlay}
      >
        <div className="song-card__cover-wrap">
          <img
            src={song.imageUrl || "/placeholder.jpg"}
            alt={song.title}
            className="song-card__img"
          />
          {hovered && (
            <div className="song-card__overlay">
              <Play size={16} fill="white" color="white" />
            </div>
          )}
        </div>
        <div className="song-card__info">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
        </div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div
        className="song-card song-card--list"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handlePlay}
      >
        <div className="song-card__cover-wrap">
          <img
            src={song.imageUrl || "/placeholder.jpg"}
            alt={song.title}
            className="song-card__img"
          />
          {hovered && (
            <div className="song-card__overlay">
              <Play size={12} fill="white" color="white" />
            </div>
          )}
        </div>
        <div className="song-card__info">
          <p className="song-card__title">{song.title}</p>
          <p className="song-card__artist">{song.artist}</p>
        </div>
      </div>
    );
  }

  return null;
}

export default SongCard;
