import { Search, Sparkles, Play, Music } from "lucide-react";
import "../styles/SuggestionSection.css";

function SuggestionSection({ query, suggestions, sourceType, onSuggestionClick, hideHeader = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  const isAI = sourceType === "ai";
  const isRandom = sourceType === "random";

  return (
    <div className="suggestion-section">
      {/* {!hideHeader && (
        <div className="suggestion-section__header">
          {isAI || isRandom ? (
            <Sparkles size={14} className="suggestion-section__icon--ai" />
          ) : (
            <Search size={14} className="suggestion-section__icon--fuzzy" />
          )}
          <span className="suggestion-section__label">
            {sourceType === "ai"
              ? "Có thể bạn đang tìm?"
              : sourceType === "random"
              ? "Có thể bạn cũng thích"
              : `Kết quả gần với "${query}"`}
          </span>
        </div>
      )} */}

      <div className="suggestion-section__cards">
        {suggestions.map((song) => (
          <button
            key={song._id}
            className="suggestion-card"
            onClick={() => onSuggestionClick(song)}
          >
            <div className="suggestion-card__img-wrap">
              {song.coverUrl ||song.imageUrl ? (
                <img
                  src={song.coverUrl || song.imageUrl}
                  alt={song.title}
                  className="suggestion-card__img"
                />
              ) : (
                <div className="suggestion-card__img-placeholder">
                  <Music size={36} />
                </div>
              )}
              <div className="suggestion-card__play-overlay">
                <Play size={14} fill="white" color="white" />
              </div>
            </div>

            <div className="suggestion-card__info">
              <p className="suggestion-card__title">{song.title}</p>
              <p className="suggestion-card__artist">{song.artist}</p>
            </div>

            {isAI && (
              <Sparkles
                size={14}
                className="suggestion-card__action-icon suggestion-card__action-icon--ai"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestionSection;
