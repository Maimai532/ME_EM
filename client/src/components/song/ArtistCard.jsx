import { Play, Heart } from "lucide-react";
import { useState } from "react";
import "../../styles/Artist_Card.css";

function ArtistCard({ artist, onPlay, layout = "scroll" }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!artist) return null;

  if (layout === "scroll") {
    return (
      <div
        className="artist-card artist-card--scroll"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="artist-card__cover-wrap">
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            className="artist-card__img"
          />
        </div>

        <div className="artist-card__info">
          <p className="artist-card__title" title={artist.name}>
            {artist.name}
          </p>
          <p className="artist-card__followers">{artist.followers}</p>
        </div>

        <button
          type="button"
          className="artist-card__like-btn"
          onClick={() => setLiked(!liked)}
        >
          <Heart
            size={16}
            fill={liked ? "red" : "none"}
            color={liked ? "red" : "#aaa"}
          />
        </button>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div
        className="artist-card artist-card--grid"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPlay && onPlay(artist)}
      >
        <div className="artist-card__cover-wrap">
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            className="artist-card__img"
          />
          {hovered && (
            <div className="artist-card__overlay">
              <Play size={14} fill="white" color="white" />
            </div>
          )}
        </div>

        <div className="artist-card__info">
          <p className="artist-card__title">{artist.name}</p>
          <p className="artist-card__followers">{artist.followers}</p>
        </div>

        <button
          type="button"
          className="artist-card__like-btn"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
        >
          <Heart
            size={14}
            fill={liked ? "red" : "none"}
            color={liked ? "red" : "#aaa"}
          />
        </button>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div
        className="artist-card artist-card--list"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPlay && onPlay(artist)}
      >
        <div className="artist-card__cover-wrap">
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            className="artist-card__img"
          />
          {hovered && (
            <div className="artist-card__overlay">
              <Play size={12} fill="white" color="white" />
            </div>
          )}
        </div>

        <div className="artist-card__info">
          <p className="artist-card__title">{artist.name}</p>
          <p className="artist-card__followers">{artist.followers}</p>
        </div>

        <button
          type="button"
          className="artist-card__like-btn"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
        >
          <Heart
            size={13}
            fill={liked ? "red" : "none"}
            color={liked ? "red" : "#aaa"}
          />
        </button>
      </div>
    );
  }

  return null;
}

export default ArtistCard;
