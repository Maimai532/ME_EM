import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Music, Music2, Play, ArrowLeft } from "lucide-react";
import { usePlayer } from "../../player/context/PlayerContext";
import useAlbumDetail from "../hooks/useAlbum";
import { Vibrant } from "node-vibrant/browser";
import { FastAverageColor } from "fast-average-color";
import "../styles/Album.css";

const fac = new FastAverageColor();

function darkenColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = 0.3;
  const nr = Math.round(r * mix);
  const ng = Math.round(g * mix);
  const nb = Math.round(b * mix);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

export default function Album() {
  const { id } = useParams();
  const { album, loading, error } = useAlbumDetail(id);
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [computedColor, setComputedColor] = useState("#181818");

  useEffect(() => {
    if (album) document.title = `${album.title} — Me_Em`;
  }, [album]);

  useEffect(() => {
    const cover = album?.coverImage;
    if (!cover) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cover;

    img.onload = async () => {
      try {
        const palette = await Vibrant.from(img).getPalette();
        const vibrant = palette.Vibrant;

        if (!vibrant || vibrant.population < 20) {
          const avg = await fac.getColorAsync(img);
          setComputedColor(avg.hex);
        } else {
          setComputedColor(darkenColor(vibrant.hex));
        }
      } catch {
        const avg = await fac.getColorAsync(img);
        setComputedColor(avg.hex);
      }
    };
  }, [album]);

  if (loading) {
    return (
      <div className="album__loading">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="album__loading">
        <p>Không tìm thấy album</p>
      </div>
    );
  }

  const songs = album.songs || [];
  const songsWithCover = songs.map((song) => ({
    ...song,
    coverUrl: song.coverUrl || song.imageUrl || album.coverImage,
  }));

  const handlePlayAlbum = () => {
    if (songsWithCover.length === 0) return;
    playSong(songsWithCover[0], songsWithCover);
  };

  return (
    <div className="album">
      <button className="album__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </button>
      <div className="album__banner" style={{ "--bg": computedColor }}>
        <div className="album__cover-wrap">
          {album.coverImage ? (
            <img
              src={album.coverImage}
              alt={album.title}
              className="album__cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="album__cover album__cover--placeholder">
              <Music2 size={40} />
            </div>
          )}
          <button
            className="album__play-btn"
            onClick={handlePlayAlbum}
            disabled={songsWithCover.length === 0}
          >
            <Play size={22} fill="black" color="black" />
          </button>
        </div>

        <div className="album__meta">
          <h1 className="album__title">{album.title}</h1>

          <div className="album__sub">
            {album.artistId?.name && (
              <span className="album__artist-name">{album.artistId.name}</span>
            )}
            {album.releaseYear && (
              <>
                <span className="album__dot">•</span>
                <span>{album.releaseYear}</span>
              </>
            )}
            <span className="album__dot">•</span>
            <span>{songs.length} bài hát</span>
          </div>
        </div>
      </div>

      {songsWithCover.length === 0 ? (
        <div className="album__empty">
          <Music2 size={48} />
          <p>Album chưa có bài hát nào</p>
        </div>
      ) : (
        <div className="album__list">
          {songsWithCover.map((song, index) => (
            <div
              key={song._id}
              className="album__item"
              onClick={() => playSong(song, songsWithCover)}
            >
              <span className="album__index">{index + 1}</span>

              {song.coverUrl ? (
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="album__image"
                />
              ) : (
                <div className="album__image album__image--placeholder">
                  <Music size={20} />
                </div>
              )}

              <div className="album__info">
                <p className="album__song-title">{song.title}</p>
                <p className="album__song-artist">{song.artist}</p>
              </div>

              {song.duration && (
                <span className="album__duration">
                  {formatDuration(song.duration)}
                </span>
              )}
            </div>
          ))}
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