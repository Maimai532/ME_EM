import ArtistCard from "./ArtistCard";
import "../styles/Artist_Section.css";
import ScrollContainer from "react-indiana-drag-scroll";
import "react-indiana-drag-scroll/dist/style.css";

function ArtistSection({ title, artist = [], onPlay }) {
  return (
    <section className="artist-section">
      <div className="artist-section__header">
        <h2 className="artist-section__title">{title}</h2>
      </div>

      <div className="artist-section__grid">
        {artist.map((a) => (
          <ArtistCard key={a._id} artist={a} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}

export default ArtistSection;