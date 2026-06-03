import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { useEffect, useState } from "react";

import { Vibrant } from "node-vibrant/browser";
import { FastAverageColor } from "fast-average-color";

import "../styles/MusicPlayer.css";

const fac = new FastAverageColor();
function darkenColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // kéo mạnh về đen
  const mix = 0.3;

  const nr = Math.round(r * mix);
  const ng = Math.round(g * mix);
  const nb = Math.round(b * mix);

  return `rgb(${nr}, ${ng}, ${nb})`;
}
export default function MusicPlayer() {
  const navigate = useNavigate();

  const { currentSong, playSong, queue, fallbackList } = usePlayer();

  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    if (!currentSong?.imageUrl) return;

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.src = currentSong.imageUrl;

    img.onload = async () => {
      try {
        const palette = await Vibrant.from(img).getPalette();

        const vibrant = palette.Vibrant;

        if (!vibrant || vibrant.population < 20) {
          const avg = await fac.getColorAsync(img);

          setBgColor(avg.hex);
        } else {
          setBgColor(darkenColor(vibrant.hex));
        }
      } catch {
        const avg = await fac.getColorAsync(img);

        setBgColor(avg.hex);
      }
    };
  }, [currentSong]);

  if (!currentSong) return null;

  const displayQueue =
    queue.length > 0
      ? [currentSong, ...queue]
      : [currentSong, ...fallbackList.filter((s) => s._id !== currentSong._id)];

  const dedupedQueue = [
    ...new Map(displayQueue.map((s) => [s._id, s])).values(),
  ];

  return (
    <div className="player-body">
      <div
        className="player-left"
        style={{
          "--bg": bgColor,
        }}
      >
        <img
          src={currentSong.imageUrl || "/placeholder.jpg"}
          alt={currentSong.title}
          className="player-cover"
          crossOrigin="anonymous"
        />

        <div className="player-meta">
          <h1 className="player-title">{currentSong.title}</h1>

          <p className="player-artist">{currentSong.artist}</p>
        </div>
      </div>

      <div className="player-right">
        <h2 className="queue-title">Tiếp theo</h2>

        <div className="queue-list">
          {dedupedQueue.map((s) => (
            <div
              key={s._id}
              className={`queue-item ${
                s._id === currentSong._id ? "queue-item--active" : ""
              }`}
              onClick={() => playSong(s, dedupedQueue)}
            >
              <img
                src={s.imageUrl || "/placeholder.jpg"}
                alt={s.title}
                className="queue-thumb"
              />

              <div className="queue-info">
                <p
                  className={`queue-item-title ${
                    s._id === currentSong._id ? "queue-item-title--active" : ""
                  }`}
                >
                  {s.title}
                </p>

                <p className="queue-item-artist">{s.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
