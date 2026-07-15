import { usePlayer } from "../context/PlayerContext";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Repeat,
  RepeatOff,
  Shuffle,
  Rewind,
  FastForward,
} from "lucide-react";
import "../styles/PlayerOSD.css";

const CONFIG = {
  play: { icon: Play, label: "Play" },
  pause: { icon: Pause, label: "Stop" },
  mute: { icon: VolumeX, label: "Mute" },
  unmute: { icon: Volume2, label: "Unmute" },
  volume: { icon: Volume2, label: null },
  "seek-forward": { icon: FastForward, label: "+ 5s" },
  "seek-backward": { icon: Rewind, label: "- 5s" },
  next: { icon: SkipForward, label: "Next" },
  prev: { icon: SkipBack, label: "Previous" },
  "shuffle-on": { icon: Shuffle, label: "Random: On" },
  "shuffle-off": { icon: Shuffle, label: "Random: Off" },
  "repeat-on": { icon: Repeat, label: "Repeat: On" },
  "repeat-off": { icon: RepeatOff, label: "Repeat: Off" },
};

export default function PlayerOSD() {
  const { osd } = usePlayer();
  if (!osd) return null;

  const cfg = CONFIG[osd.type];
  if (!cfg) return null;
  const Icon = cfg.icon; // có thể undefined với seek-forward/seek-backward

  return (
    <div key={osd.id} className="player-osd">
      {Icon && (
        <div className="player-osd__icon">
          <Icon size={36} />
        </div>
      )}
      {osd.type === "volume" && (
        <div className="player-osd__bar">
          <div
            className="player-osd__bar-fill"
            style={{ width: `${(osd.payload ?? 0) * 100}%` }}
          />
        </div>
      )}
      {cfg.label && <span className="player-osd__label">{cfg.label}</span>}
    </div>
  );
}
