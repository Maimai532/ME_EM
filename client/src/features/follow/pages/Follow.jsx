import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";

import followService from "../../../shared/services/follow.service";
import { artistService } from "../../../shared/services/artist.service";

import "./../styles/Follow.css";

export default function Follow() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState(null);

  useEffect(() => {
    document.title = "Following Artists — Me_Em";
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const { data } = await followService.getFollowingArtists();
      setArtists((data.data || []).map((artist) => ({
        ...artist,
        isFollowing: true,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (artistId) => {
    if (followLoadingId) return;

    try {
      setFollowLoadingId(artistId);
      const { data } = await artistService.toggleFollow(artistId);

      setArtists((currentArtists) =>
        currentArtists.map((artist) =>
          artist._id === artistId
            ? {
                ...artist,
                isFollowing: data.isFollowing,
                followersCount: data.followersCount,
              }
            : artist,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="follow">
        <p className="follow__loading">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="follow">
      <div className="follow__header">
        <h1>Following Artists</h1>
        <span>
          {artists.filter((artist) => artist.isFollowing).length} artists
        </span>
      </div>

      {artists.length === 0 ? (
        <div className="follow__empty">
          <Music2 size={60} />
          <h3>Chưa theo dõi nghệ sĩ nào</h3>
          <p>
            Theo dõi nghệ sĩ để nhận thông báo khi họ phát hành bài hát mới.
          </p>
        </div>
      ) : (
        <div className="follow__grid">
          {artists.map((artist) => (
            <article key={artist._id} className="follow__card">
              <Link to={`/artist/${artist._id}`} className="follow__card-link">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="follow__avatar"
                  />
                ) : (
                  <div className="follow__avatar follow__avatar--placeholder">
                    <Music2 size={32} />
                  </div>
                )}

                <div className="follow__info">
                  <h3>{artist.name}</h3>

                  {/* {artist.country && <span>{artist.country}</span>} */}
                  <p className="follow__followers">
                    {artist.followersCount || 0} followers
                  </p>
                </div>
              </Link>

              <button
                type="button"
                className={`follow__button ${
                  artist.isFollowing ? "follow__button--active" : ""
                }`}
                onClick={() => handleFollow(artist._id)}
                disabled={followLoadingId === artist._id}
              >
                {followLoadingId === artist._id
                  ? "..."
                  : artist.isFollowing
                    ? "Following"
                    : "Follow"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
