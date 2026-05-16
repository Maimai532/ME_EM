import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchSongs } from "../../home/services/songService";
import { usePlayer } from "../../player/context/PlayerContext";
import "../styles/Search.css";
import { Play } from "lucide-react";

function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (!q) return;

    const fetchResults = async () => {
      setLoading(true);
      const songs = await searchSongs(q);
      setResults(songs);
      setLoading(false);
    };

    fetchResults();
  }, [q]);

  return (
    <div className="search-page">
      {/* <h2 className="search-page__title">Kết quả cho: "{q}"</h2> */}

      {loading && <p className="search-page__loading">Đang tìm...</p>}

      {!loading && results.length === 0 && (
        <p className="search-page__empty">Không tìm thấy bài hát nào.</p>
      )}

      <div className="search-page__list">
        {results.map((song, index) => (
          <div
            key={song._id}
            className="search-page__item"
            onClick={() => playSong(song, results)}
          >
            {/* <span className="search-page__index">{index + 1}</span> */}
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
    </div>
  );
}

export default Search;
