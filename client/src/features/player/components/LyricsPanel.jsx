// LyricsPanel.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePlayer } from "../context/PlayerContext";
import { getLyricsBySongId } from "../services/lyricsService";
import "../styles/LyricsPanel.css";

export default function LyricsPanel() {
  const { currentSong, currentTime } = usePlayer();

  const [lyrics, setLyrics] = useState([]);
  const [status, setStatus] = useState("idle");
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  // Sắp xếp lyrics theo thời gian
  const sortedLyrics = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return [];
    return [...lyrics].sort((a, b) => a.time - b.time);
  }, [lyrics]);

  const LYRIC_OFFSET = 0.3;

  const activeLineIndex = useMemo(() => {
    if (!sortedLyrics.length || currentTime == null) return -1;

    const adjustedTime = currentTime + LYRIC_OFFSET;

    let lastIndex = -1;
    for (let i = 0; i < sortedLyrics.length; i++) {
      if (sortedLyrics[i].time <= adjustedTime) {
        lastIndex = i;
      } else {
        break;
      }
    }
    return lastIndex;
  }, [sortedLyrics, currentTime]);

  useEffect(() => {
    if (!currentSong?._id) {
      setStatus("idle");
      setLyrics([]);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setLyrics([]);

    getLyricsBySongId(currentSong._id)
      .then((data) => {
        if (cancelled) return;

        if (!data.lyrics || data.lyrics.length === 0) {
          setStatus("empty");
          return;
        }

        const validLyrics = data.lyrics.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.time === "number" &&
            typeof item.text === "string",
        );

        if (validLyrics.length === 0) {
          setStatus("empty");
          return;
        }

        setLyrics(validLyrics);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Lyrics fetch error:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [currentSong?._id]);

  useEffect(() => {
    if (activeLineIndex < 0 || !lineRefs.current[activeLineIndex]) return;
    const el = lineRefs.current[activeLineIndex];
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLineIndex]);

  const renderLyrics = () => {
    if (!sortedLyrics || sortedLyrics.length === 0) {
      return (
        <div className="lyrics-container">
          <p className="plain-text">Không có lyrics</p>
        </div>
      );
    }

    return (
      <div className="lyrics-container">
        {sortedLyrics.map((line, idx) => (
          <div
            key={idx}
            ref={(el) => (lineRefs.current[idx] = el)}
            className={`lyric-line ${idx === activeLineIndex ? "active" : ""}`}
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  };

  if (status === "idle") {
    return (
      <div className="lyrics-panel">
        <p className="message">Chọn bài hát để xem lyrics</p>
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="lyrics-panel">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="message">Đang tải lyrics...</p>
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="lyrics-panel">
        <p className="message error">⚠️ Không thể tải lyrics</p>
        <button
          className="retry-btn"
          onClick={() => {
            setStatus("loading");
            getLyricsBySongId(currentSong._id)
              .then((data) => {
                if (data.lyrics?.length > 0) {
                  setLyrics(data.lyrics);
                  setStatus("ready");
                } else {
                  setStatus("empty");
                }
              })
              .catch(() => setStatus("error"));
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (status === "empty") {
    return (
      <div className="lyrics-panel">
        <p className="message">Chưa có lyrics cho bài hát này</p>
      </div>
    );
  }

  return (
    <div className="lyrics-panel" ref={containerRef}>
      {renderLyrics()}
    </div>
  );
}
