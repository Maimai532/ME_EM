import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Music2 } from "lucide-react";
import { usePlayer } from "../../player/context/PlayerContext";
import useArtistDetail from "../hooks/useArtist";
import "../styles/Artist.css";

export default function Artist() {
  const { id } = useParams();
  const { artist, loading, error } = useArtistDetail(id);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (artist) document.title = `${artist.name} — Me_Em`;
  }, [artist]);

  if (loading) {
    return (
      <div className="artist__loading">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="artist__loading">
        <p>Không tìm thấy nghệ sĩ</p>
      </div>
    );
  }

  const songs = artist.songs || [];

  return (
    <div className="artist">
      <div className="artist__header">
        <div className="artist__avatar-wrap">
          {artist.avatar ? (
            <img
              src={artist.avatar}
              alt={artist.name}
              className="artist__avatar"
            />
          ) : (
            <div className="artist__avatar-placeholder">
              <Music2 size={40} />
            </div>
          )}
        </div>
        <div class="artist__overlay"></div>
        <div className="artist__meta">
          <h1 className="artist__name">{artist.name}</h1>

          {artist.country && (
            <p className="artist__country">{artist.country}</p>
          )}

          {artist.description && (
            <p className="artist__desc">{artist.description}</p>
          )}

          {/* <p className="artist__count">{songs.length} bài hát</p> */}
        </div>
      </div>
      {songs.length === 0 ? (
        <div className="artist__empty">
          <Music2 size={48} />
          <p>Chưa có bài hát nào</p>
        </div>
      ) : (
        <div className="artist__list">
          <div className="artist__song">
            {songs.map((song, index) => (
              <div
                key={song._id}
                className="artist__item"
                onClick={() => playSong(song, songs)}
              >
                <span className="artist__index">{index + 1}</span>

                <img
                  src={song.imageUrl || "/placeholder.jpg"}
                  alt={song.title}
                  className="artist__image"
                />

                <div className="artist__info">
                  <p className="artist__song-title">{song.title}</p>
                  <p className="artist__artist-name">{song.artist}</p>
                </div>

                {song.duration && (
                  <span className="artist__duration">
                    {formatDuration(song.duration)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {artist.albums?.length > 0 && (
            <section className="artist__albums">
              <h2 className="artist__section-title">
                Album ({artist.albums.length})
              </h2>

              <div className="artist__albums-grid">
                {artist.albums.map((album) => (
                  <div key={album._id} className="artist__album-card">
                    <img
                      src={album.coverImage || "/placeholder.jpg"}
                      alt={album.title}
                      className="artist__album-cover"
                    />

                    <div className="artist__album-info">
                      <h3>{album.title}</h3>
                      <span>
                        {album.releaseYear || "Unknown"} •{" "}
                        {album.songs?.length || 0} bài
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
