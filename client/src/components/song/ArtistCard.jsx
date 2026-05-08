import { Play, Heart } from "lucide-react";
import { useState } from "react";

const scrollStyles = {
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    width: "180px",
    flexShrink: 0,
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    color: "#333",
    cursor: "pointer",
  },
  coverWrap: {
    position: "relative",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.85)",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    textAlign: "center",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "2px",
  },
  artist: {
    fontSize: "12px",
    color: "#666",
  },
  likeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

const gridStyles = {
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
    height: "60px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    color: "#333",
    cursor: "pointer",
  },
  coverWrap: {
    position: "relative",
    width: "44px",
    height: "44px",
    flexShrink: 0,
    borderRadius: "6px",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    overflow: "hidden",
  },
  title: {
    fontWeight: "bold",
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  artist: {
    fontSize: "12px",
    color: "#666",
  },
  likeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
  },
};

const listStyles = {
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    height: "48px",
    padding: "6px 8px",
    borderBottom: "1px solid #eee",
    color: "#333",
    cursor: "pointer",
  },
  coverWrap: {
    position: "relative",
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "4px",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    overflow: "hidden",
  },
  title: {
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  artist: {
    fontSize: "11px",
    color: "#666",
  },
  likeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
  },
};

function ArtistCard({ artist, onPlay, layout = "scroll" }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!artist) return null;

  if (layout === "scroll") {
    const s = scrollStyles;
    return (
      <div
        style={s.card}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={s.coverWrap}>
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            style={s.img}
          />
        </div>

        <div style={s.info}>
          <p style={s.title} title={artist.name}>
            {artist.name}
          </p>
          <p style={s.artist}>{artist.followers}</p>
        </div>

        <button style={s.likeBtn} onClick={() => setLiked(!liked)}>
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
    const s = gridStyles;
    return (
      <div
        style={s.card}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPlay && onPlay(artist)}
      >
        <div style={s.coverWrap}>
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            style={s.img}
          />
          {hovered && (
            <div style={s.overlay}>
              <Play size={14} fill="white" color="white" />
            </div>
          )}
        </div>

        <div style={s.info}>
          <p style={s.title}>{artist.name}</p>
          <p style={s.artist}>{artist.followers}</p>
        </div>

        <button
          style={s.likeBtn}
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
    const s = listStyles;
    return (
      <div
        style={s.card}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPlay && onPlay(artist)}
      >
        <div style={s.coverWrap}>
          <img
            src={artist.imageUrl || "/placeholder.jpg"}
            alt={artist.name}
            style={s.img}
          />
          {hovered && (
            <div style={s.overlay}>
              <Play size={12} fill="white" color="white" />
            </div>
          )}
        </div>

        <div style={s.info}>
          <p style={s.title}>{artist.name}</p>
          <p style={s.artist}>{artist.followers}</p>
        </div>

        <button
          style={{ ...s.likeBtn, opacity: hovered ? 1 : 0 }}
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
}

export default ArtistCard;
