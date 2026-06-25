import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../shared/constants/api";
import "../styles/Admin_Section.css";
import "../styles/Admin_Playlist.css";

function extractItems(res) {
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}

function normalizeGenre(g) {
  return g
    .trim()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function splitGenres(genreStr) {
  if (!genreStr) return [];
  return genreStr
    .split(/,|\/| và /)
    .map(normalizeGenre)
    .filter(Boolean);
}

function renderGenreBadges(genre) {
  const genres = splitGenres(genre);
  if (genres.length === 0) return "—";
  return genres.map((g) => (
    <span key={g} className="song-admin__genre-badge">
      {g}
    </span>
  ));
}

function ManageItemsModal({ section, onClose, token }) {
  const isArtist = section.type === "artist";
  const [allItems, setAllItems] = useState([]);
  const initialSectionItems = isArtist
    ? Array.isArray(section?.artists)
      ? section.artists.filter(Boolean)
      : []
    : Array.isArray(section?.songs)
      ? section.songs.filter(Boolean)
      : [];
  const [sectionItems, setSectionItems] = useState(initialSectionItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    const endpoint = isArtist ? `${API_URL}/artists` : `${API_URL}/songs`;
    axios
      .get(endpoint)
      .then((res) => setAllItems(extractItems(res)))
      .catch(() => setAllItems([]));
  }, [isArtist]);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  async function handleAdd(itemId) {
    try {
      if (isArtist) {
        await axios.post(
          `${API_URL}/sections/${section._id}/artists`,
          { artistId: itemId },
          config,
        );
      } else {
        await axios.post(
          `${API_URL}/sections/${section._id}/songs`,
          { songId: itemId },
          config,
        );
      }
      const item = allItems.find((i) => i._id === itemId);
      if (item) setSectionItems((prev) => [...prev, item]);
    } catch (err) {
      alert(err.response?.data?.message || "Thêm thất bại");
    }
  }

  async function handleRemove(itemId) {
    try {
      if (isArtist) {
        await axios.delete(`${API_URL}/sections/${section._id}/artists`, {
          ...config,
          data: { artistId: itemId },
        });
      } else {
        await axios.delete(`${API_URL}/sections/${section._id}/songs`, {
          ...config,
          data: { songId: itemId },
        });
      }
      setSectionItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    }
  }

  const sectionItemIds = sectionItems.filter(Boolean).map((i) => i._id);
  const itemsNotInSection = allItems.filter(
    (i) => !sectionItemIds.includes(i._id),
  );

  const q = searchQuery.trim().toLowerCase();

  const filteredItems = itemsNotInSection.filter((item) => {
    if (isArtist) {
      const matchSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.genre?.toLowerCase().includes(q);
      return matchSearch;
    }

    const songGenres = splitGenres(item.genre);
    const matchGenre =
      selectedGenre === "all" || songGenres.includes(selectedGenre);
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.artist?.toLowerCase().includes(q) ||
      item.genre?.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  const genreOptions = isArtist
    ? []
    : [
        "all",
        ...Array.from(
          new Set(
            itemsNotInSection.flatMap((s) =>
              s.genre ? splitGenres(s.genre) : [],
            ),
          ),
        ).sort(),
      ];

  const itemLabel = isArtist ? "nghệ sĩ" : "bài";
  const searchPlaceholder = isArtist
    ? "Tìm tên nghệ sĩ / thể loại..."
    : "Tìm tên bài / artist / thể loại...";

  return (
    <div className="section-admin-overlay">
      <div className="section-admin-modal section-admin-modal--wide">
        <div className="section-admin__head">
          <div className="section-admin-modal__header-row">
            <h2>
              Section: <strong>{section.name}</strong>
              <span className="section-admin__type-tag">
                {isArtist ? "Artist" : "Song"}
              </span>
            </h2>
            <button
              type="button"
              className="section-admin__btn-save"
              onClick={onClose}
            >
              Xong
            </button>
          </div>

          <div className="section-filter-bar">
            <div className="section-filter-bar__search-wrap">
              <span className="section-filter-bar__icon">🔍</span>
              <input
                className="section-filter-bar__search"
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="section-filter-bar__clear"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            {!isArtist && (
              <select
                className="playlist-filter-bar__genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {g === "all" ? "Tất cả thể loại" : g}
                  </option>
                ))}
              </select>
            )}

            {!isArtist && (searchQuery || selectedGenre !== "all") && (
              <button
                type="button"
                className="playlist-filter-bar__reset"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("all");
                }}
              >
                Xoá lọc
              </button>
            )}

            <span className="section-filter-bar__count">
              {filteredItems.length}/{itemsNotInSection.length} {itemLabel}
            </span>
          </div>
        </div>

        <div className="section-table-body">
          <div className="section-table-block">
            <table className="section-table">
              <thead>
                <tr>
                  <th className="section-table__th">#</th>
                  {isArtist ? (
                    <>
                      <th className="section-table__th">Tên nghệ sĩ</th>
                      <th className="section-table__th">Thể loại</th>
                    </>
                  ) : (
                    <>
                      <th className="section-table__th">Tên bài hát</th>
                      <th className="section-table__th">Artist</th>
                      <th className="section-table__th">Genre</th>
                    </>
                  )}
                  <th className="section-table__th section-table-label--in">
                    <span className="section-table-count">
                      {sectionItems.length}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sectionItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isArtist ? 4 : 5}
                      className="section-table__empty"
                    >
                      {isArtist ? "Chưa có nghệ sĩ nào" : "Trống"}
                    </td>
                  </tr>
                ) : isArtist ? (
                  sectionItems.map((artist, i) => (
                    <tr
                      key={artist._id}
                      className="section-table__row section-table__row--in"
                    >
                      <td className="section-table__td section-table__td--num">
                        {i + 1}
                      </td>
                      <td className="section-table__td section-table__td--name">
                        <div className="section-artist-cell">
                          {artist.imageUrl && (
                            <img
                              src={artist.imageUrl}
                              alt={artist.name}
                              className="section-artist-avatar"
                            />
                          )}
                          <span>{artist.name}</span>
                        </div>
                      </td>
                      <td className="section-table__td">
                        {artist.genre || "—"}
                      </td>
                      <td className="section-table__td section-table__td--action">
                        <button
                          type="button"
                          className="section-table__btn section-table__btn--remove"
                          onClick={() => handleRemove(artist._id)}
                        >
                          −
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  sectionItems.map((song, i) => (
                    <tr
                      key={song._id}
                      className="section-table__row section-table__row--in"
                    >
                      <td className="section-table__td section-table__td--num">
                        {i + 1}
                      </td>
                      <td className="section-table__td section-table__td--name">
                        {song.title}
                      </td>
                      <td className="section-table__td">{song.artist}</td>
                      <td className="section-table__td">
                        {renderGenreBadges(song.genre)}
                      </td>
                      <td className="section-table__td section-table__td--action">
                        <button
                          type="button"
                          className="section-table__btn section-table__btn--remove"
                          onClick={() => handleRemove(song._id)}
                        >
                          −
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-table-block">
            <table className="section-table">
              <thead>
                <tr>
                  <th className="section-table__th">#</th>
                  {isArtist ? (
                    <>
                      <th className="section-table__th">Tên nghệ sĩ</th>
                      <th className="section-table__th">Thể loại</th>
                    </>
                  ) : (
                    <>
                      <th className="section-table__th">Tên bài hát</th>
                      <th className="section-table__th">Artist</th>
                      <th className="section-table__th">Genre</th>
                    </>
                  )}
                  <th className="section-table__th section-table-label--add">
                    <span className="section-table-count">
                      {itemsNotInSection.length}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isArtist ? 4 : 5}
                      className="section-table__empty"
                    >
                      {itemsNotInSection.length === 0
                        ? isArtist
                          ? "Tất cả đã trong section"
                          : "Trống"
                        : isArtist
                          ? "Không tìm thấy nghệ sĩ"
                          : "Không tìm thấy bài hát phù hợp"}
                    </td>
                  </tr>
                ) : isArtist ? (
                  filteredItems.map((artist, i) => (
                    <tr
                      key={artist._id}
                      className="section-table__row section-table__row--add"
                    >
                      <td className="section-table__td section-table__td--num">
                        {i + 1}
                      </td>
                      <td className="section-table__td section-table__td--name">
                        <div className="section-artist-cell">
                          {artist.imageUrl && (
                            <img
                              src={artist.imageUrl}
                              alt={artist.name}
                              className="section-artist-avatar"
                            />
                          )}
                          <span>{artist.name}</span>
                        </div>
                      </td>
                      <td className="section-table__td">
                        {artist.genre || "—"}
                      </td>
                      <td className="section-table__td section-table__td--action">
                        <button
                          type="button"
                          className="section-table__btn section-table__btn--add"
                          onClick={() => handleAdd(artist._id)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredItems.map((song, i) => (
                    <tr
                      key={song._id}
                      className="section-table__row section-table__row--add"
                    >
                      <td className="section-table__td section-table__td--num">
                        {i + 1}
                      </td>
                      <td className="section-table__td section-table__td--name">
                        {song.title}
                      </td>
                      <td className="section-table__td">{song.artist}</td>
                      <td className="section-table__td">
                        {renderGenreBadges(song.genre)}
                      </td>
                      <td className="section-table__td section-table__td--action">
                        <button
                          type="button"
                          className="section-table__btn section-table__btn--add"
                          onClick={() => handleAdd(song._id)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageItemsModal;
