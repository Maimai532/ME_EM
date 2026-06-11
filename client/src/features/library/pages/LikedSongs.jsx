import { useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePlayer } from "../../player/context/PlayerContext";
import { Heart } from "lucide-react";
import "../../library/styles/LikedSongs.css";

export default function LikedSongs() {
  const { likedSongs, fetchLikedSongs, toggleLike } = useAuth();
  const { playSong } = usePlayer();

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  return (
    <div className="liked">
      {/* Header */}
      <div className="liked__header">
        <div className="liked__cover">
          <Heart size={36} color="#ff5c8a" fill="#ff5c8a" />
        </div>

        <div>
          <p className="liked__type">Playlist</p>
          <h1 className="liked__title">Bài hát yêu thích</h1>
          <p className="liked__count">
            {likedSongs.length} bài hát
          </p>
        </div>
      </div>

      {/* Empty */}
      {likedSongs.length === 0 ? (
        <div className="liked__empty">
          <Heart size={48} />
          <p>Chưa có bài nào được thích.</p>
        </div>
      ) : (
        <div className="liked__list">
          {likedSongs.map((song, index) => (
            <div
              key={song._id}
              className="liked__item"
              onClick={() => playSong(song, likedSongs)}
            >
              <span className="liked__index">
                {index + 1}
              </span>

              <img
                src={song.imageUrl || "/placeholder.jpg"}
                alt={song.title}
                className="liked__image"
              />

              <div className="liked__info">
                <p className="liked__song-title">
                  {song.title}
                </p>
                <p className="liked__artist">
                  {song.artist}
                </p>
              </div>

              <button
                className="liked__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song._id);
                }}
                title="Bỏ thích"
              >
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}