import { useEffect, useRef } from "react";
import { usePlayer } from "../../features/player/context/PlayerContext";

export default function useKeyboardShortcuts() {
  const player = usePlayer();
  const playerRef = useRef(player);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable;
      if (isTyping) return;

      const {
        currentSong,
        togglePlay,
        toggleMute,
        playNext,
        playPrev,
        seek,
        currentTime,
        duration,
        changeVolume,
        volume,
        toggleRepeat,
        toggleShuffle,
      } = playerRef.current;

      if (!currentSong) return;

      // % theo 0-9
      if (e.code.startsWith("Digit") || e.code.startsWith("Numpad")) {
        const digit = Number(e.code.replace("Digit", "").replace("Numpad", ""));
        if (!Number.isNaN(digit) && duration > 0) {
          e.preventDefault();
          const targetTime = (digit / 10) * duration;
          seek(targetTime);
          return;
        }
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;

        case "KeyM":
          toggleMute();
          break;

        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(currentTime + 5, duration));
          break;

        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(currentTime - 5, 0));
          break;

        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(+(volume + 0.05).toFixed(2), 1));
          break;

        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(+(volume - 0.05).toFixed(2), 0));
          break;

        case "KeyN":
          playNext();
          break;

        case "KeyP":
          playPrev();
          break;

        //BUG: Các phím gõ dấu do EVKey
        case "KeyH":
          toggleShuffle();
          break;
        case "KeyL":
          toggleRepeat();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // deps rỗng — chỉ add/remove listener đúng 1 lần khi mount/unmount
  }, []);
}
