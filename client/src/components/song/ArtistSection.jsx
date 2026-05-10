
import ArtistCard from "./ArtistCard";
import "../../styles/Artist_Section.css";

// layout = "scroll" | grid | list
function ArtistSection({ title, artist = [], onPlay, layout = "scroll" }) {
  return (
    <section className="artist-section">
      <div className="artist-section__header">
        <h2 className="artist-section__title">{title}</h2>
        <button type="button" className="artist-section__link-all">
          Xem tất cả
        </button>
      </div>

      <div className={`artist-section__grid artist-section__grid--${layout}`}>
        {artist.map((a) => (
          <ArtistCard
            key={a._id}
            artist={a}
            onPlay={onPlay}
            layout={layout}
          />
        ))}
      </div>
    </section>
  );
}

export default ArtistSection;
