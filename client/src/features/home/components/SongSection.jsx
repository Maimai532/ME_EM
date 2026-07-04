// SongSection.jsx
import SongCard from "./SongCard";
import "../styles/SongSection.css";
import { usePlayer } from "../../player/context/PlayerContext";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";
import { Play } from "lucide-react";

function SongSection({ title, songs = [], onPlay, layout = "scroll" }) {
  const { playSong } = usePlayer();
  function handlePlayAll(e) {
    e?.stopPropagation();
    if (!songs.length) return;
    playSong(songs[0], songs);
  }
  return (
    <section className="song-section">
      <div className="song-section__header">
        <h2 className="song-section__title">{title}</h2>
        <button
          type="button"
          className="song-section__play-btn"
          onClick={handlePlayAll}
          disabled={!songs.length}
        >
          <Play size={16} />
        </button>
      </div>

      <div className={`song-section__grid song-section__grid--${layout}`}>
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            onPlay={onPlay}
            layout={layout}
            songList={songs}
          />
        ))}
      </div>

      {/* <ScrollContainer className={`song-section__grid song-section__grid--${layout}`}>
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            onPlay={onPlay}
            layout={layout}
            songList={songs}
          />
        ))}
        </ScrollContainer> */}
    </section>
  );
}

export default SongSection;
