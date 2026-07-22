import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Music2, ArrowLeft, Music } from "lucide-react";
import { usePlayer } from "../../player/context/PlayerContext";
import useArtistDetail from "../hooks/useArtist";
import "../styles/Artist.css";
import { artistService } from "../../../shared/services/artist.service";

export default function Artist() {
  const { id } = useParams();
  const { artist, loading, error } = useArtistDetail(id);
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (artist) document.title = `${artist.name} — Me_Em`;
  }, [artist]);
  useEffect(() => {
    if (!artist) return;

    setIsFollowing(artist.isFollowing);
    setFollowersCount(artist.followersCount);
  }, [artist]);
  const handleFollow = async () => {
    if (followLoading) return;

    try {
      setFollowLoading(true);

      const { data } = await artistService.toggleFollow(id);

      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

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
        <div className="artist__overlay"></div>
        <div className="artist__meta">
          <h1 className="artist__name">{artist.name}</h1>

          {artist.country && (
            <p className="artist__country">{artist.country}</p>
          )}

          {artist.description && (
            <p className="artist__desc">{artist.description}</p>
          )}
          <div className="artist__actions">
            <button
              className={`artist__follow ${
                isFollowing ? "artist__follow--active" : ""
              }`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>

            <span className="artist__followers">
              {followersCount} followers
            </span>
          </div>

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

                {song.coverUrl || song.imageUrl ? (
                  <img
                    src={song.coverUrl || song.imageUrl}
                    alt={song.title}
                    className="artist__image"
                  />
                ) : (
                  <div className="artist__image artist__image--placeholder">
                    <Music size={20} />
                  </div>
                )}

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
                {artist.albums.slice(0, 6).map((album) => (
                  <div
                    key={album._id}
                    className="artist__album-card"
                    onClick={() => navigate(`/album/${album._id}`)}
                  >
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="artist__album-cover"
                      />
                    ) : (
                      <div className="artist__album-cover artist__album-cover--placeholder">
                        <Music size={24} />
                      </div>
                    )}

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
