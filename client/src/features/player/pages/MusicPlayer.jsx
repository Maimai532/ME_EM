import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { useEffect, useState } from "react";
import LyricsPanel from "../components/LyricsPanel";
import { Vibrant } from "node-vibrant/browser";
import { FastAverageColor } from "fast-average-color";
import "../styles/MusicPlayer.css";
import { Music } from "lucide-react";


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
  const {
    currentSong,
    playSong,
    queue,
    fallbackList,
    isMusicPlayerVisible,
    isColorBgEnabled,
  } = usePlayer();
  const [computedColor, setComputedColor] = useState("#000000");
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    const cover = currentSong?.coverUrl || currentSong?.imageUrl;
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
  }, [currentSong]);

  if (!currentSong) return null;

  const displayQueue =
    queue.length > 0
      ? [currentSong, ...queue]
      : [currentSong, ...fallbackList.filter((s) => s._id !== currentSong._id)];

  const dedupedQueue = [
    ...new Map(displayQueue.map((s) => [s._id, s])).values(),
  ];
  const tabs = [
    { key: "queue", label: "Tiếp theo" },
    { key: "lyrics", label: "Lyrics" },
    { key: "related", label: "Bài hát của..." },
  ];
  const bgColor = isColorBgEnabled ? computedColor : "#000000";

  return (
    <div
      className={`player-body ${!isMusicPlayerVisible ? "player-body--hidden" : ""}`}
      style={{ "--bg": bgColor }}
    >
      <div className="player-left">
        {currentSong.coverUrl || currentSong.imageUrl ? (
          <img
            src={currentSong.coverUrl || currentSong.imageUrl}
            alt={currentSong.title}
            className="player-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="player-cover player-cover--placeholder">
            <Music size={150} />
          </div>
        )}
      </div>

      <div className="player-right">
        <div className="queue-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`queue-tab ${
                activeTab === tab.key ? "queue-tab--active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="queue-panel">

          {activeTab === "queue" && (
            <div className="queue-list">
              {dedupedQueue.map((s) => (
                <div
                  key={s._id}
                  className={`queue-item ${
                    s._id === currentSong._id ? "queue-item--active" : ""
                  }`}
                  onClick={() => playSong(s, dedupedQueue)}
                >
                  {s.coverUrl || s.imageUrl ? (
                    <img
                      src={s.coverUrl || s.imageUrl}
                      alt={s.title}
                      className="queue-thumb"
                    />
                  ) : (
                    <div className="queue-thumb queue-thumb--placeholder">
                      <Music size={20} />
                    </div>
                  )}

                  <div className="queue-info">
                    <p
                      className={`queue-item-title ${
                        s._id === currentSong._id
                          ? "queue-item-title--active"
                          : ""
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="queue-item-artist">{s.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "lyrics" && <LyricsPanel />}

          {activeTab === "related" && (
            <div className="related-panel">
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
