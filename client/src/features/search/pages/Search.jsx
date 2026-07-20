import { artistService } from "../../../shared/services/artist.service";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchSongs, getAllSongs } from "../../home/services/songService";
import { usePlayer } from "../../player/context/PlayerContext";
import {
  getFuzzySuggestions,
  getAISuggestions,
} from "../services/suggestionService";
import SuggestionSection from "../components/SuggestionSection";
import "../styles/Search.css";
import { Play, Music, User, Disc3 } from "lucide-react";

function normalize(str) {
  return str.toLowerCase().replace(/[-_\s]/g, "");
}

function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarity(a, b) {
  const s1 = normalize(a),
    s2 = normalize(b);
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  const dist = levenshtein(s1, s2);
  return 1 - dist / Math.max(s1.length, s2.length);
}

function scoreSong(song, q) {
  const nq = normalize(q);
  const title = normalize(song.title || "");
  const artist = normalize(song.artist || "");
  const genres = parseGenres(song.genre).map((g) => normalize(g));

  let score = 0;

  // Title
  if (title === nq) score = Math.max(score, 1.0);
  else if (title.startsWith(nq)) score = Math.max(score, 0.9);
  else if (title.includes(nq)) score = Math.max(score, 0.8);
  else score = Math.max(score, similarity(title, nq) * 0.75);

  // Artist
  if (artist === nq) score = Math.max(score, 0.95);
  else if (artist.startsWith(nq)) score = Math.max(score, 0.85);
  else if (artist.includes(nq)) score = Math.max(score, 0.75);
  else score = Math.max(score, similarity(artist, nq) * 0.65);

  // Genre
  for (const g of genres) {
    if (g === nq) score = Math.max(score, 0.92);
    else if (g.startsWith(nq) || nq.startsWith(g))
      score = Math.max(score, 0.82);
    else if (g.includes(nq)) score = Math.max(score, 0.72);
    else {
      const sim = similarity(g, nq);
      if (sim >= 0.65) score = Math.max(score, sim * 0.7); // threshold thấp hơn
    }
  }

  return score;
}

function parseGenres(genreStr) {
  if (!genreStr) return [];
  return genreStr
    .split(/[/,&\\]/)
    .map((g) => g.trim())
    .filter(Boolean);
}

async function getMatchedArtists(query, limit = 4) {
  try {
    const res = await artistService.getAll();
    const artists = res.data || [];
    const q = query.toLowerCase();

    return artists
      .map((artist) => {
        const name = (artist.name || "").toLowerCase();
        let score = 0;
        if (name === q) score = 1;
        else if (name.startsWith(q)) score = 0.9;
        else if (name.includes(q)) score = 0.75;
        else score = similarity(name, q) * 0.6;
        return { artist, score };
      })
      .filter(({ score }) => score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ artist }) => artist);
  } catch {
    return [];
  }
}

async function getTopArtistMatch(query) {
  try {
    const res = await artistService.getAll();
    const artists = res.data || [];
    const q = query.toLowerCase();

    let best = null;
    let bestScore = 0;

    for (const artist of artists) {
      const name = (artist.name || "").toLowerCase();
      let score = 0;
      if (name === q) score = 1;
      else if (name.startsWith(q)) score = 0.92;
      else if (name.includes(q)) score = 0.8;
      else score = similarity(name, q) * 0.6;

      if (score > bestScore) {
        bestScore = score;
        best = artist;
      }
    }

    return bestScore >= 0.45 ? { artist: best, score: bestScore } : null;
  } catch {
    return null;
  }
}

async function getTopResult(query) {
  try {
    const all = await getAllSongs();
    const q = query.toLowerCase();
    const scored = all
      .map((song) => ({ song, score: scoreSong(song, q) }))
      .filter(({ score }) => score >= 0.55) // ngưỡng điểm truy vấn, càng gần 1 -> gắt
      .sort((a, b) => b.score - a.score);
    return scored[0]?.song || null; // chỉ 1 cái tốt nhất
  } catch {
    return null;
  }
}

async function getRelatedSongs(query, topResult, limit = 8) {
  try {
    const all = await getAllSongs();
    const q = query.toLowerCase();
    const excludeId = topResult?._id;

    const scored = all
      .filter((s) => s._id !== excludeId)
      .map((song) => {
        let score = scoreSong(song, q);

        // Bonus: cùng nghệ sĩ với topResult
        if (
          topResult &&
          normalize(song.artist) === normalize(topResult.artist)
        ) {
          score = Math.max(score, 0.6);
        }
        // Bonus: cùng genre với topResult
        if (topResult) {
          const topGenres = parseGenres(topResult.genre).map(normalize);
          const songGenres = parseGenres(song.genre).map(normalize);
          const hasCommonGenre = topGenres.some((g) => songGenres.includes(g));
          if (hasCommonGenre) score = Math.max(score, 0.5);
        }

        return { song, score };
      })
      .filter(({ score }) => score >= 0.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ song }) => song);
  } catch {
    return [];
  }
}

async function getRandomSongs(excludeIds, limit = 8) {
  try {
    const all = await getAllSongs();
    return all
      .filter((s) => !excludeIds.has(s._id))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  } catch {
    return [];
  }
}

function SongItem({ song, queue, playSong }) {
  return (
    <div className="search-page__item" onClick={() => playSong(song, queue)}>
      <div className="search-page__img-wrap">
        <img
          src={song.coverUrl || song.imageUrl || "/placeholder.jpg"}
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
        {/* {song.genre && <p className="search-page__genre">{song.genre}</p>} */}
      </div>
    </div>
  );
}

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q");
  const { playSong } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState([]);
  const [topResultType, setTopResultType] = useState("song");
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [topResult, setTopResult] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSource, setSuggestionSource] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    document.title = q ? `${q} - Me_EM` : "Search";
  }, [q]);

  const handleSuggestionClick = useCallback(
    (song) => playSong(song, suggestions),
    [playSong, suggestions],
  );

  useEffect(() => {
    if (!q) return;

    setArtists([]);
    setSuggestions([]);
    setSuggestionSource(null);
    setTopResult(null);
    setRelatedSongs([]);

    const fetchAll = async () => {
      setLoading(true);

      const [topSong, matchedArtists, topArtistMatch] = await Promise.all([
        getTopResult(q),
        getMatchedArtists(q),
        getTopArtistMatch(q),
      ]);

      const songScore = topSong ? scoreSong(topSong, q.toLowerCase()) : 0;
      const artistScore = topArtistMatch?.score || 0;

      // Artist thắng khi điểm artist cao hơn (buffer nhỏ tránh nhảy lung tung)
      const artistWins = artistScore > 0 && artistScore + 0.05 >= songScore;

      // Dùng biến local cho top result, KHÔNG đọc lại từ state (state chưa kịp update)
      let finalTopResult = artistWins ? topArtistMatch.artist : topSong;
      let finalTopResultType = artistWins ? "artist" : "song";

      setArtists(matchedArtists);
      setLoading(false);

      const songForRelated =
        finalTopResultType === "song" ? finalTopResult : null;
      let related = await getRelatedSongs(q, songForRelated);

      if (!finalTopResult && related.length === 0) {
        const all = await getAllSongs();
        const shuffled = all.sort(() => Math.random() - 0.5);
        finalTopResult = shuffled[0] || null; // 1 bài random làm top result
        finalTopResultType = "song";
        related = shuffled.slice(1, 9); // 8 bài tiếp làm related
      }

      setTopResult(finalTopResult);
      setTopResultType(finalTopResultType);
      setRelatedSongs(related);

      setLoadingSuggestions(true);
      const allExcluded = new Set([
        ...(finalTopResultType === "song" && finalTopResult
          ? [finalTopResult._id]
          : []),
        ...related.map((s) => s._id),
      ]);

      const fuzzy = await getFuzzySuggestions(q, getAllSongs);
      const filteredFuzzy = fuzzy.filter((s) => !allExcluded.has(s._id));
      if (filteredFuzzy.length > 0) {
        setSuggestions(filteredFuzzy);
        setSuggestionSource("fuzzy");
        setLoadingSuggestions(false);
        return;
      }

      const ai = await getAISuggestions(q, getAllSongs);
      const filteredAI = ai.filter((s) => !allExcluded.has(s._id));
      if (filteredAI.length > 0) {
        setSuggestions(filteredAI);
        setSuggestionSource("ai");
        setLoadingSuggestions(false);
        return;
      }

      const random = await getRandomSongs(allExcluded);
      if (random.length > 0) {
        setSuggestions(random);
        setSuggestionSource("random");
      }
      setLoadingSuggestions(false);
    };

    fetchAll();
  }, [q]);

  const hasAnything =
    !!topResult || artists.length > 0 || relatedSongs.length > 0;

  return (
    <div className="search-page">
      {loading && <p className="search-page__label">Đang tìm...</p>}

      {!loading && !hasAnything && !loadingSuggestions && (
        <p className="search-page__label">
          Không tìm thấy kết quả cho <strong>"{q}"</strong>
        </p>
      )}
      <div className="search-page__results">
        <div className="search-page__top-result">
          {!loading && topResult && (
            <section className="search-page__section">
              <h2 className="search-page__label">Kết quả gần nhất</h2>
              <div
                className="search-top-card"
                onClick={() => {
                  if (topResultType === "artist") {
                    navigate(`/artist/${topResult._id}`);
                  } else {
                    playSong(
                      topResult,
                      relatedSongs.length
                        ? [topResult, ...relatedSongs]
                        : [topResult],
                    );
                  }
                }}
              >
                <div className="search-top-card__img-wrap">
                  <img
                    src={
                      topResultType === "artist"
                        ? topResult.avatar || "/default-artist.png"
                        : topResult.coverUrl ||
                          topResult.imageUrl ||
                          "/placeholder.jpg"
                    }
                    alt={topResult.title || topResult.name}
                  />
                  {topResultType === "song" && (
                    <div className="search-top-card__play-overlay">
                      <Play size={20} fill="white" color="white" />
                    </div>
                  )}
                </div>
                <p className="search-top-card__title">
                  {topResultType === "artist"
                    ? topResult.name
                    : topResult.title}
                </p>
                <p className="search-top-card__sub">
                  {topResultType === "artist" ? "Nghệ sĩ" : topResult.artist}
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="search-page__related">
          {!loading && relatedSongs.length > 0 && (
            <section className="search-page__section">
              <h2 className="search-page__label">Bài hát liên quan</h2>
              <div className="search-page__list">
                {relatedSongs.map((song) => (
                  <SongItem
                    key={song._id}
                    song={song}
                    queue={relatedSongs}
                    playSong={playSong}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/*Có thể bạn quan tâm*/}
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
