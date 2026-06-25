import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Artist_Card.css";

function ArtistCard({ artist, onPlay }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  if (!artist) return null;

  return (
    <div
      className="artist-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/artist/${artist._id}`)}
    >
      <div className="artist-card__cover-wrap">
        <img
          src={artist.avatar || "/placeholder.jpg"}
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
    </div>
  );
}

export default ArtistCard;