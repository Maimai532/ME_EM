// SongSection.jsx

import SongCard from "./SongCard";
import "../styles/SongSection.css";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";

// layout = "scroll" : hàng ngang cuộn
// layout = "grid"   : lưới nhiều cột
// layout = "list"   : danh sách dọc
function SongSection({ title, songs = [], onPlay, layout = "scroll" }) {
  return (
    <section className="song-section">
      <div className="song-section__header">
        <h2 className="song-section__title">{title}</h2>
        <button type="button" className="song-section__play-btn" onClick={onPlay}>
          Phát
        </button>
      </div>

    
        <ScrollContainer className={`song-section__grid song-section__grid--${layout}`}>
        {songs.map((song) => (
          <SongCard
            key={song._id}
            song={song}
            onPlay={onPlay}
            layout={layout}
            songList={songs}
          />
        ))}
        </ScrollContainer>

    </section>
  );
}

export default SongSection;
