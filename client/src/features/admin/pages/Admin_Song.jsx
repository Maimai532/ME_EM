import axios from "axios";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/hooks/useToast";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Songs.css";
import { API_URL } from "../../../shared/constants/api";
import { useState, useEffect, useRef } from "react";
import ConfirmModal from "../components/ConfirmModal";

const emptyForm = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  audioUrl: "",
  audioKey: "",
  imageUrl: "",
  sourceType: "upload",
};

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

function splitArtists(artistStr) {
  if (!artistStr) return [];
  return artistStr
    .split(/,|\/| và /)
    .map((a) => a.trim())
    .filter(Boolean);
}

function normalizeSongForm(input = {}) {
  // Chỉ suy ra sourceType khi DB không có giá trị hợp lệ
  const validTypes = ["upload", "url", "b2key"];
  let sourceType = validTypes.includes(input.sourceType)
    ? input.sourceType
    : input.audioKey?.trim()
      ? "b2key"
      : input.audioUrl?.trim()
        ? "url"
        : "upload";

  return {
    title: input.title ?? "",
    artist: input.artist ?? "",
    album: input.album ?? "",
    genre: input.genre ?? "",
    audioUrl: input.audioUrl ?? "", // giữ nguyên, không lọc theo sourceType
    audioKey: input.audioKey ?? "", // giữ nguyên, không lọc theo sourceType
    imageUrl: input.imageUrl ?? "",
    sourceType,
    _id: input._id,
  };
}

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className={`custom-select__trigger ${open ? "custom-select__trigger--open" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <span>{selected?.label}</span>
        <svg
          className={`custom-select__arrow ${open ? "custom-select__arrow--up" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="custom-select__dropdown">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select__option ${opt.value === value ? "custom-select__option--active" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.value === value && (
                <span className="custom-select__check">✓</span>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DetailForm({ song, token, onSaved, onClose, onDelete }) {
  const safeSong = normalizeSongForm({ ...emptyForm, ...(song || {}) });
  const isEdit = !!safeSong._id;
  const { showToast } = useToast();

  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [audioMode, setAudioMode] = useState(null); // null | "url" | "b2key"

  const [form, setForm] = useState(safeSong);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safeSong.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(!isEdit);

  useEffect(() => {
    const s = normalizeSongForm({ ...emptyForm, ...(song || {}) });
    console.log("Song detail:", s);
    setForm(s);
    setAudioFile(null);
    setImageFile(null);
    setImagePreview(s.imageUrl || "");
    setIsDirty(!s._id);
  }, [song?._id, song]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(form.imageUrl || "");
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, form.imageUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "sourceType") {
      setAudioFile(null);
      setForm((prev) => ({
        ...prev,
        sourceType: value,
        audioUrl: value !== "url" ? "" : prev.audioUrl,
        audioKey: value !== "b2key" ? "" : prev.audioKey,
      }));
      setIsDirty(true);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
    setIsDirty(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (audioFile) fd.append("audio", audioFile);
      if (imageFile) fd.append("image", imageFile);

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`${API_URL}/songs/${safeSong._id}`, fd, config);
      } else {
        await axios.post(`${API_URL}/songs`, fd, config);
      }

      showToast(isEdit ? "Đã lưu!" : "Đã tạo!", "success");
      onSaved();
    } catch {
      showToast("Có lỗi!", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!song) {
    return (
      <div className="song-admin__detail-empty">
        <div className="song-admin__detail-empty-icon">♪</div>
        <span>Chọn bài hát để xem chi tiết</span>
        <span style={{ fontSize: 11, marginTop: 2 }}>
          hoặc nhấn New song để thêm mới
        </span>
      </div>
    );
  }

  return (
    <div className="song-admin__detail-form">
      <div className="song-admin__detail-title">
        {isEdit ? "Chi tiết bài hát" : "Thêm bài hát"}
      </div>

      <div className="song-admin__detail-top">
        <div className="song-admin__detail-image-col">
          {imagePreview ? (
            <div className="song-admin__preview-wrap">
              <img
                src={imagePreview}
                alt="preview"
                className="song-admin__preview"
              />
              <button
                type="button"
                className="song-admin__preview-remove"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                  setForm((prev) => ({ ...prev, imageUrl: "" }));
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <label className="song-admin__preview-placeholder">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    setForm((p) => ({ ...p, imageUrl: "" }));
                    setIsDirty(true);
                  }
                }}
              />
              <span className="song-admin__preview-placeholder-icon">🖼️</span>
              <span>Chọn ảnh</span>
            </label>
          )}
        </div>

        <div className="song-admin__detail-fields-col">
          <label className="song-admin__label" style={{ marginTop: 0 }}>
            Tên bài hát <span>*</span>
          </label>
          <input
            className="song-admin__input"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <label className="song-admin__label">
            Nghệ sĩ <span>*</span>
          </label>
          <input
            className="song-admin__input"
            name="artist"
            value={form.artist}
            onChange={handleChange}
          />

          <label className="song-admin__label">Album</label>
          <input
            className="song-admin__input"
            name="album"
            value={form.album}
            onChange={handleChange}
          />

          <label className="song-admin__label">
            Thể loại <span>*</span>
          </label>
          <input
            className="song-admin__input"
            name="genre"
            value={form.genre}
            onChange={handleChange}
          />
        </div>
      </div>
      <label className="song-admin__label">Audio</label>

      {isEdit &&
      !audioFile &&
      !audioMode &&
      (song?.audioUrl?.trim() || song?.audioKey?.trim()) ? (
        <div className="audio-field__existing">
          <i className="ti ti-music" aria-hidden="true" />
          <span className="audio-field__existing-name">
            {song.audioKey?.trim() || song.audioUrl?.trim()}
          </span>
          <button
            type="button"
            className="audio-field__replace-btn"
            onClick={() => setShowAudioMenu((p) => !p)}
          >
            Thay thế {showAudioMenu ? "▴" : "▾"}
          </button>
        </div>
      ) : null}

      {/* Dropdown chọn cách thay thế */}
      {showAudioMenu && (
        <div className="audio-field__menu">
          <label className="audio-field__menu-item">
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setAudioFile(file);
                  setShowAudioMenu(false);
                  setIsDirty(true);
                }
              }}
            />
            <i className="ti ti-upload" aria-hidden="true" />
            <span>Upload file từ máy</span>
            <small>mp3, flac, wav...</small>
          </label>
          <button
            type="button"
            className="audio-field__menu-item"
            onClick={() => {
              setAudioMode("url");
              setShowAudioMenu(false);
            }}
          >
            <i className="ti ti-link" aria-hidden="true" />
            <span>Nhập URL</span>
            <small>https://...</small>
          </button>
          <button
            type="button"
            className="audio-field__menu-item"
            onClick={() => {
              setAudioMode("b2key");
              setShowAudioMenu(false);
            }}
          >
            <i className="ti ti-cloud" aria-hidden="true" />
            <span>Nhập B2 Key</span>
            <small>songs/abc.mp3</small>
          </button>
        </div>
      )}

      {/* Đã chọn file mới */}
      {audioFile && (
        <div className="audio-field__picked">
          <i className="ti ti-file-music" aria-hidden="true" />
          <span className="audio-field__picked-name">
            {audioFile.name} · {(audioFile.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button
            type="button"
            className="audio-field__picked-remove"
            onClick={() => setAudioFile(null)}
          >
            Xoá
          </button>
        </div>
      )}

      {/* Input URL */}
      {audioMode === "url" && (
        <input
          className="song-admin__input"
          name="audioUrl"
          value={form.audioUrl}
          onChange={handleChange}
          placeholder="https://..."
          style={{ marginTop: 6 }}
        />
      )}

      {/* Input B2 Key */}
      {audioMode === "b2key" && (
        <input
          className="song-admin__input"
          name="audioKey"
          value={form.audioKey}
          onChange={handleChange}
          placeholder="songs/abc123.mp3"
          style={{ marginTop: 6 }}
        />
      )}

      {/* Thêm mới / bài chưa có audio */}
      {!isEdit && !audioFile && (
        <label className="audio-field__empty">
          <input
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                setAudioFile(file);
                setIsDirty(true);
              }
            }}
          />
          <i className="ti ti-upload" aria-hidden="true" />
          <span>Chọn file audio để upload</span>
        </label>
      )}

      <label className="song-admin__label">Ảnh bìa (URL)</label>
      <input
        className="song-admin__input"
        name="imageUrl"
        value={form.imageUrl}
        onChange={handleChange}
        placeholder="https://..."
      />

      <label className="song-admin__file-picker" style={{ marginTop: 6 }}>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImageFile(file);
            if (file) {
              setForm((p) => ({ ...p, imageUrl: "" }));
              setIsDirty(true);
            }
          }}
        />
        {imageFile ? "✓ Đã chọn ảnh" : "Chọn ảnh từ máy"}
      </label>

      <div className="song-admin__form-footer">
        {isEdit && (
          <button
            type="button"
            className="song-admin__btn-del-song"
            onClick={onDelete}
          >
            Xoá
          </button>
        )}
        <button
          type="button"
          className="song-admin__btn-cancel"
          onClick={onClose}
        >
          Huỷ
        </button>
        <button
          type="button"
          className="song-admin__btn-save"
          onClick={handleSubmit}
          disabled={loading || !isDirty}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}

function Admin_Song() {
  const { token } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSong, setActiveSong] = useState(null);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [genreInput, setGenreInput] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [missingFilter, setMissingFilter] = useState("");
  const [page, setPage] = useState(1);

  const tableRef = useRef(null);

  function fetchSongs(onDone) {
    setLoading(true);
    axios
      .get(`${API_URL}/songs`)
      .then((res) => {
        setSongs(res.data.data);
        onDone?.();
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, genreFilter, sortBy, missingFilter]);

  function handleSaved() {
    const scrollTop = tableRef.current?.scrollTop ?? 0;
    fetchSongs(() => {
      requestAnimationFrame(() => {
        if (tableRef.current) tableRef.current.scrollTop = scrollTop;
      });
    });
  }

  function handleNewSong() {
    setActiveSong({ ...emptyForm, _id: undefined });
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  const genres = [
    ...new Set(songs.flatMap((s) => splitGenres(s.genre))),
  ].sort();

  const filteredSongs = songs.filter((song) => {
    const kw = search.toLowerCase();
    const matchSearch =
      song.title?.toLowerCase().includes(kw) ||
      song.artist?.toLowerCase().includes(kw);
    const matchGenre =
      !genreFilter || splitGenres(song.genre).includes(genreFilter);
    const matchMissing =
      !missingFilter ||
      (missingFilter === "title" && !song.title?.trim()) ||
      (missingFilter === "genre" && !song.genre?.trim()) ||
      (missingFilter === "image" && !song.imageUrl?.trim()) ||
      (missingFilter === "audio" &&
        !song.audioUrl?.trim() &&
        !song.audioKey?.trim());
    return matchSearch && matchGenre && matchMissing;
  });

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return (a.title || "").localeCompare(b.title || "");
      case "name_desc":
        return (b.title || "").localeCompare(a.title || "");
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case "plays_desc":
        return (b.plays || 0) - (a.plays || 0);
      default:
        return 0;
    }
  });

  const PAGE_SIZE = 30;
  const totalPages = Math.ceil(sortedSongs.length / PAGE_SIZE);
  const pagedSongs = sortedSongs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const visibleSongIds = pagedSongs.map((s) => s._id);
  const allVisibleSelected =
    visibleSongIds.length > 0 &&
    visibleSongIds.every((id) => selected.includes(id));

  function toggleSelectAll() {
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleSongIds.includes(id))
        : [...new Set([...prev, ...visibleSongIds])],
    );
  }

  function handleDeleteSelected() {
    const count = selected.length;
    setConfirm({
      message: `Xoá ${count} bài hát?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await Promise.all(
            selected.map((id) =>
              axios.delete(`${API_URL}/songs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ),
          );
          setSelected([]);
          if (selected.includes(activeSong?._id)) setActiveSong(null);
          fetchSongs();
          showToast(`Đã xoá ${count} bài hát`, "success");
        } catch {
          alert("Có lỗi khi xoá");
        }
      },
    });
  }

  function handleDeleteSingle() {
    if (!activeSong?._id) return;
    setConfirm({
      message: `Xoá "${activeSong.title || "bài hát này"}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await axios.delete(`${API_URL}/songs/${activeSong._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setActiveSong(null);
          fetchSongs();
          showToast("Đã xoá", "success");
        } catch {
          alert("Có lỗi khi xoá");
        }
      },
    });
  }

  const headerActions = (
    <>
      {selected.length > 0 && (
        <button
          type="button"
          className="song-admin__btn-add song-admin__btn-add--danger"
          onClick={handleDeleteSelected}
        >
          Delete ({selected.length})
        </button>
      )}
      <button
        type="button"
        className="song-admin__btn-add"
        onClick={handleNewSong}
      >
        New song
      </button>
    </>
  );

  return (
    <AdminPage title="Quản lý bài hát" actions={headerActions}>
      <div className="song-admin__layout">
        {/* ── Left panel ── */}
        <div className="song-admin__left">
          <div className="song-admin__meta">
            Songs <span>{songs.length}</span>
          </div>

          <div className="song-admin__filter">
            <input
              type="text"
              placeholder="Tìm tên bài hát / nghệ sĩ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected([]);
              }}
              className="song-admin__search-input"
            />

            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
                { value: "name_asc", label: "A → Z" },
                { value: "name_desc", label: "Z → A" },
                // { value: "plays_desc", label: "Lượt nghe" },
              ]}
            />

            <CustomSelect
              value={missingFilter}
              onChange={(v) => {
                setMissingFilter(v);
                setSelected([]);
              }}
              options={[
                { value: "", label: "Tất cả" },
                { value: "title", label: "Thiếu tên" },
                { value: "genre", label: "Thiếu thể loại" },
                { value: "image", label: "Thiếu ảnh" },
                { value: "audio", label: "Thiếu audio" },
              ]}
            />
            <div className="song-admin__genre">
              <input
                type="text"
                placeholder="Lọc thể loại..."
                value={genreInput}
                className="song-admin__sort-input"
                onChange={(e) => {
                  setGenreInput(e.target.value);
                  setGenreFilter(e.target.value.trim());
                  setSelected([]);
                  setShowGenreDropdown(true);
                }}
                onFocus={() => setShowGenreDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowGenreDropdown(false), 150)
                }
              />
              {showGenreDropdown && (
                <ul className="song-admin__genre-suggestions">
                  {(genreInput.trim()
                    ? genres.filter((g) =>
                        g.toLowerCase().includes(genreInput.toLowerCase()),
                      )
                    : genres
                  ).map((g) => (
                    <li
                      key={g}
                      className="song-admin__genre-suggestion-item"
                      onMouseDown={() => {
                        setGenreFilter(g);
                        setGenreInput(g);
                        setSelected([]);
                        setShowGenreDropdown(false);
                      }}
                    >
                      {g}
                    </li>
                  ))}
                  {genreInput.trim() && (
                    <li
                      className="song-admin__genre-suggestion-item song-admin__genre-suggestion-item--clear"
                      onMouseDown={() => {
                        setGenreFilter("");
                        setGenreInput("");
                        setSelected([]);
                        setShowGenreDropdown(false);
                      }}
                    >
                      Clear
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Inline detail / edit form */}
          <DetailForm
            key={activeSong?._id ?? "new-or-empty"}
            song={activeSong}
            token={token}
            onSaved={() => {
              handleSaved();
              if (!activeSong?._id) setActiveSong(null);
            }}
            onClose={() => setActiveSong(null)}
            onDelete={handleDeleteSingle}
          />
        </div>

        {/* ── Right panel ── */}
        <div className="song-admin__right">
          {loading ? (
            <p className="song-admin__loading">Đang tải...</p>
          ) : (
            <>
              <div className="song-admin__table-shell">
                <div className="song-admin__table-wrapper" ref={tableRef}>
                  <table className="song-admin__table">
                    <colgroup>
                      <col className="song-admin__col-select" />
                      <col className="song-admin__col-name" />
                      <col className="song-admin__col-artist" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="song-admin__th">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="song-admin__th">Tên</th>
                        <th className="song-admin__th">Nghệ sĩ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedSongs.length > 0 ? (
                        pagedSongs.map((song) => (
                          <tr
                            key={song._id}
                            className={[
                              "song-admin__row",
                              selected.includes(song._id)
                                ? "song-admin__row--selected"
                                : "",
                              activeSong?._id === song._id
                                ? "song-admin__row--active"
                                : "",
                            ].join(" ")}
                            onClick={() =>
                              setActiveSong({ ...emptyForm, ...song })
                            }
                          >
                            <td className="song-admin__td">
                              <input
                                type="checkbox"
                                checked={selected.includes(song._id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelect(song._id)}
                              />
                            </td>
                            <td className="song-admin__td">{song.title}</td>
                            <td className="song-admin__td">
                              {splitArtists(song.artist).length > 0
                                ? splitArtists(song.artist).map((a) => (
                                    <span
                                      key={a}
                                      className="song-admin__artist-badge"
                                    >
                                      {a}
                                    </span>
                                  ))
                                : "—"}
                            </td>
 
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="song-admin__empty">
                            Không tìm thấy bài hát
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(1)}>
                    ««
                  </button>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                  <span className="pagination__info">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ›
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    »»
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AdminPage>
  );
}

export default Admin_Song;
