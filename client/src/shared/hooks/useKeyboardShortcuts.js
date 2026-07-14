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
        showOsd,
          isPlaying,   // thiếu cái này thì lỗi y hệt bạn đang gặp
  isRepeat,    // và cái này
  isShuffle, 
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
          showOsd(isPlaying ? "pause" : "play");
          break;

        case "KeyM": {
          toggleMute();
          showOsd(volume > 0 ? "mute" : "unmute");
          break;
        }

        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(currentTime + 5, duration));
          showOsd("seek-forward");
          break;

        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(currentTime - 5, 0));
          showOsd("seek-backward");
          break;

        case "ArrowUp": {
          e.preventDefault();
          const v = Math.min(+(volume + 0.05).toFixed(2), 1);
          changeVolume(v);
          showOsd("volume", v);
          break;
        }

        case "ArrowDown": {
          e.preventDefault();
          const v = Math.max(+(volume - 0.05).toFixed(2), 0);
          changeVolume(v);
          showOsd("volume", v);
          break;
        }

        case "KeyN":
          playNext();
          showOsd("next");
          break;

        case "KeyP":
          playPrev();
          showOsd("prev");
          break;

        case "KeyH":
          toggleShuffle();
          showOsd(isShuffle ? "shuffle-off" : "shuffle-on");
          break;

        case "KeyL":
          toggleRepeat();
          showOsd(isRepeat ? "repeat-off" : "repeat-on");
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
