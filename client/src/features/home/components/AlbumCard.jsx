import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Play } from "lucide-react";
import "../styles/AlbumCard.css";

function AlbumCard({ album }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  if (!album) return null;

  return (
    <div
      className="album-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/album/${album._id}`)}
    >
      <div className="album-card__cover-wrap">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="album-card__img"
          />
        ) : (
          <div className="album-card__img--placeholder">
            <Music size={36} />
          </div>
        )}
        {hovered && (
          <div className="album-card__overlay">
            <button type="button" className="album-card__play-btn">
              <Play size={16} fill="white" color="white" />
            </button>
          </div>
        )}
      </div>
      <div className="album-card__info">
        <p className="album-card__title" title={album.title}>
          {album.title}
        </p>
        <p className="album-card__artist">{album.artistId?.name || ""}</p>
      </div>
    </div>
  );
}

export default AlbumCard;
