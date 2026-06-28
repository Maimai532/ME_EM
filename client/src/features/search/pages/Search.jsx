import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchSongs, getAllSongs } from "../../home/services/songService";
import { usePlayer } from "../../player/context/PlayerContext";
import {
  getFuzzySuggestions,
  getAISuggestions,
} from "../services/suggestionService";
import SuggestionSection from "../components/SuggestionSection";
import "../styles/Search.css";
import { Play } from "lucide-react";

async function getRandomSongs(getAllSongs, excludeIds, limit = 8) {
  try {
    const all = await getAllSongs();
    const pool = all.filter((s) => !excludeIds.has(s._id));
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch {
    return [];
  }
}

function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSource, setSuggestionSource] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { playSong } = usePlayer();

  const handleSuggestionClick = useCallback(
    (song) => {
      playSong(song, suggestions);
    },
    [playSong, suggestions],
  );

  useEffect(() => {
    if (!q) return;

    setResults([]);
    setSuggestions([]);
    setSuggestionSource(null);

    const fetchAll = async () => {
      setLoading(true);
      const songs = await searchSongs(q);
      setResults(songs);
      setLoading(false);

      setLoadingSuggestions(true);

      const resultIds = new Set(songs.map((s) => s._id));

      const fuzzy = await getFuzzySuggestions(q, getAllSongs);
      const filteredFuzzy = fuzzy.filter((s) => !resultIds.has(s._id));

      if (filteredFuzzy.length > 0) {
        setSuggestions(filteredFuzzy);
        setSuggestionSource("fuzzy");
        setLoadingSuggestions(false);
        return;
      }

      const ai = await getAISuggestions(q, getAllSongs);
      const filteredAI = ai.filter((s) => !resultIds.has(s._id));

      if (filteredAI.length > 0) {
        setSuggestions(filteredAI);
        setSuggestionSource("ai");
        setLoadingSuggestions(false);
        return;
      }

      const random = await getRandomSongs(getAllSongs, resultIds);
      if (random.length > 0) {
        setSuggestions(random);
        setSuggestionSource("random");
      }

      setLoadingSuggestions(false);
    };

    fetchAll();
  }, [q]);

  return (
    <div className="search-page">
      {loading && <p className="search-page__label">Đang tìm...</p>}

      {!loading && results.length > 0 && (
        <p className="search-page__label">Kết quả hàng đầu</p>
      )}
      <div className="search-page__list">
        {results.map((song) => (
          <div
            key={song._id}
            className="search-page__item"
            onClick={() => playSong(song, results)}
          >
            <div className="search-page__img-wrap">
              <img
                src={song.imageUrl || "/placeholder.jpg"}
                alt={song.title}
                className="search-page__img"
              />
              <div className="search-page__play-overlay">
                <Play size={16} fill="white" color="white" />
              </div>
            </div>
            <div className="search-page__info">
              <p className="search-page__song-title">{song.title}</p>
              <p className="search-page__artist">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && results.length === 0 && (
        <p className="search-page__label">
          Không tìm thấy kết quả cho <strong>"{q}"</strong>
        </p>
      )}

      {/* Gợi ý */}
      {!loading && (
        <>
          {loadingSuggestions && (
            <p className="search-page__label">Các bài hát tương tự...</p>
          )}
          {suggestions.length > 0 && !loadingSuggestions && (
            <p className="search-page__label">Có thể bạn quan tâm</p>
          )}
          <SuggestionSection
            query={q}
            suggestions={suggestions}
            sourceType={suggestionSource}
            onSuggestionClick={handleSuggestionClick}
            hideHeader
          />
        </>
      )}
    </div>
  );
}

export default Search;
