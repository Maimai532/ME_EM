import axios from "axios";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/hooks/useToast";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Songs.css";
import { API_URL } from "../../../shared/constants/api";
import { useState, useEffect, useRef } from "react";

const emptyForm = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  audioUrl: "",
  audioKey: "",
  imageUrl: "",
  sourceType: "b2key",
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
        onClick={() => setOpen((prev) => !prev)}
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

function normalizeSongForm(input = {}) {
  return {
    title: input.title ?? "",
    artist: input.artist ?? "",
    album: input.album ?? "",
    genre: input.genre ?? "",
    audioUrl: input.sourceType === "url" ? (input.audioUrl ?? "") : "",
    audioKey: input.sourceType === "b2key" ? (input.audioKey ?? "") : "",
    imageUrl: input.imageUrl ?? "",
    sourceType: input.sourceType ?? "b2key", // mặc định cho audio url
    _id: input._id,
  };
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div className="song-admin-overlay">
      <div className="song-admin-modal song-admin-modal--narrow">
        <p className="song-admin-modal__message">{message}</p>
        <div className="song-admin-modal__footer">
          <button
            type="button"
            className="song-admin__btn-cancel"
            onClick={onCancel}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="song-admin__btn-save song-admin__btn-save--danger"
            onClick={onConfirm}
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

function SongModal({ song, onClose, onSaved, token }) {
  const safeSong = normalizeSongForm({ ...emptyForm, ...(song || {}) });
  const isEdit = !!safeSong._id;
  const { showToast } = useToast();

  const [form, setForm] = useState(safeSong);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safeSong.imageUrl || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(form.imageUrl || "");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile, form.imageUrl]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter" && !loading) {
        const tag = document.activeElement?.tagName;

        if (tag === "INPUT" && document.activeElement.type === "file") return;

        e.preventDefault();
        handleSubmit();
      }

      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [loading, form, audioFile, imageFile]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "sourceType") {
      if (value === "url" || value === "b2key") {
        setAudioFile(null);
      }

      setForm((prev) => ({
        ...prev,
        sourceType: value,
        audioUrl: value !== "url" ? "" : prev.audioUrl,
        audioKey: value !== "b2key" ? "" : prev.audioKey,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const authHeader = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (audioFile || imageFile) {
        const fd = new FormData();

        Object.entries(form).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            fd.append(k, v);
          }
        });

        if (audioFile) fd.append("audio", audioFile);
        if (imageFile) fd.append("image", imageFile);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (isEdit) {
          await axios.put(`${API_URL}/songs/${safeSong._id}`, fd, config);
        } else {
          await axios.post(`${API_URL}/songs`, fd, config);
        }
      } else {
        if (isEdit) {
          await axios.put(`${API_URL}/songs/${safeSong._id}`, form, authHeader);
        } else {
          await axios.post(`${API_URL}/songs`, form, authHeader);
        }
      }

      onSaved();

      showToast(
        isEdit ? "Update success!" : "Creat success!",
        "success",
      );

      onClose();
    } catch {
      showToast("Có lỗi!", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="song-admin-overlay">
      <div className="song-admin-modal">
        <h2 className="song-admin-modal__title">
          {isEdit ? "Edit Song" : "New Song"}
        </h2>

        <div className="song-input">
          <div className="song-info">
            <label className="song-admin__label">
              Tên bài hát <span>*</span>
            </label>

            <input
              className="song-admin__input"
              name="title"
              value={form.title || ""}
              onChange={handleChange}
            />

            <label className="song-admin__label">
              Nghệ sĩ <span>*</span>
            </label>

            <input
              className="song-admin__input"
              name="artist"
              value={form.artist || ""}
              onChange={handleChange}
            />

            <label className="song-admin__label">Album</label>

            <input
              className="song-admin__input"
              name="album"
              value={form.album || ""}
              onChange={handleChange}
            />

            <label className="song-admin__label">
              Thể loại <span>*</span>
            </label>

            <input
              className="song-admin__input"
              name="genre"
              value={form.genre || ""}
              onChange={handleChange}
            />
          </div>

          <div className="song-src">
            <label className="song-admin__label">Audio</label>

            <div className="song-admin__radio-group">
              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="b2key"
                  checked={form.sourceType === "b2key"}
                  onChange={handleChange}
                />{" "}
                B2 Key
              </label>

              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="url"
                  checked={form.sourceType === "url"}
                  onChange={handleChange}
                />{" "}
                URL
              </label>

              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="upload"
                  checked={form.sourceType === "upload"}
                  onChange={handleChange}
                />{" "}
                Upload
              </label>
            </div>

            {form.sourceType === "b2key" && (
              <input
                className="song-admin__input song-admin__input--mt-sm"
                name="audioKey"
                value={form.audioKey || ""}
                onChange={handleChange}
                placeholder="new_song/abc123-song.mp3"
              />
            )}

            {form.sourceType === "url" && (
              <input
                className="song-admin__input song-admin__input--mt-sm"
                name="audioUrl"
                value={form.audioUrl || ""}
                onChange={handleChange}
                placeholder="https://..."
              />
            )}

            {form.sourceType === "upload" && (
              <>
                <label className="song-admin__file-picker">
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;

                      setAudioFile(file);

                      if (file) {
                        setForm((prev) => ({
                          ...prev,
                          sourceType: "upload",
                          audioUrl: "",
                          audioKey: "",
                        }));
                      }
                    }}
                  />

                  {audioFile ? "✓ Đã chọn tệp audio" : "Chưa chọn tệp audio"}
                </label>

                {audioFile && (
                  <button
                    type="button"
                    className="song-admin__remove-file"
                    onClick={() => setAudioFile(null)}
                  >
                    Xoá audio
                  </button>
                )}
              </>
            )}

            <label className="song-admin__label">Ảnh bìa</label>

            <input
              className="song-admin__input"
              name="imageUrl"
              value={form.imageUrl || ""}
              onChange={handleChange}
              placeholder="https://..."
            />

            <label className="song-admin__file-picker">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  setImageFile(file);

                  if (file) {
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: "",
                    }));
                  }
                }}
              />

              {imageFile ? "✓ Đã chọn ảnh" : "Chưa chọn ảnh"}
            </label>

            {imagePreview && (
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

                    setForm((prev) => ({
                      ...prev,
                      imageUrl: "",
                    }));
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="song-admin-modal__footer">
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
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin_Song() {
  const { token } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [genreInput, setGenreInput] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [missingFilter, setMissingFilter] = useState("");

  function fetchSongs() {
    setLoading(true);
    axios
      .get(`${API_URL}/songs`)
      .then((res) => setSongs(res.data.data))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSongs();
  }, []);

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelected(
      selected.length === songs.length ? [] : songs.map((s) => s._id),
    );
  }

  async function handleDeleteSelected() {
    setConfirm({
      message: `Xoá ${selected.length} bài hát?`,
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
          fetchSongs();
          showToast(`Đã xoá ${selected.length} bài hát`, "success");
        } catch {
          alert("Có lỗi khi xoá");
        }
      },
    });
  }

  const genres = [
    ...new Set(songs.flatMap((s) => splitGenres(s.genre))),
  ].sort();

  const filteredSongs = songs.filter((song) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      song.title?.toLowerCase().includes(keyword) ||
      song.artist?.toLowerCase().includes(keyword);

    const matchGenre =
      !genreFilter || splitGenres(song.genre).includes(genreFilter);

    const matchMissing =
      !missingFilter ||
      (missingFilter === "title" && !song.title?.trim()) ||
      (missingFilter === "genre" && !song.genre?.trim()) ||
      (missingFilter === "image" && !song.imageUrl?.trim());

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
        onClick={() => setModal(emptyForm)}
      >
        New song
      </button>
    </>
  );

  return (
    <AdminPage title="Quản lý bài hát" actions={headerActions}>
      <div className="song-admin-meta">
        Songs: <span>{songs.length}</span>
      </div>
      <div className="song-admin__filter-bar">
        <input
          type="text"
          placeholder="Tìm tên bài hát/nghệ sĩ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="song-admin__search-input"
        />

        <div className="song-admin__genre">
          <input
            type="text"
            placeholder="Lọc thể loại..."
            value={genreInput}
            className="song-admin__search-input"
            onChange={(e) => {
              setGenreInput(e.target.value);
              setGenreFilter(e.target.value.trim());
              setShowGenreDropdown(true);
            }}
            onFocus={() => setShowGenreDropdown(true)}
            onBlur={() => setTimeout(() => setShowGenreDropdown(false), 150)}
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
                    setShowGenreDropdown(false);
                  }}
                >
                  Clear
                </li>
              )}
            </ul>
          )}
        </div>

        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "newest", label: "Mới" },
            { value: "oldest", label: "Cũ" },
            { value: "name_asc", label: "A→Z" },
            { value: "name_desc", label: "Z→A" },
            { value: "plays_desc", label: "Lượt nghe" },
          ]}
        />

        <CustomSelect
          value={missingFilter}
          onChange={setMissingFilter}
          options={[
            { value: "", label: "Tất cả" },
            { value: "title", label: "⚠ Thiếu tên" },
            { value: "genre", label: "⚠ Thiếu thể loại" },
            { value: "image", label: "⚠ Thiếu ảnh" },
          ]}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="song-admin__table-wrapper">
          <table className="song-admin__table">
            <colgroup>
              <col className="song-admin__col-select" />
              <col className="song-admin__col-image" />
              <col className="song-admin__col-name" />
              <col className="song-admin__col-artist" />
              <col className="song-admin__col-genre" />
              <col className="song-admin__col-listen" />
            </colgroup>
            <thead>
              <tr>
                <th className="song-admin__th">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === songs.length && songs.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="song-admin__th">Ảnh</th>
                <th className="song-admin__th">Name</th>
                <th className="song-admin__th">Artist</th>
                <th className="song-admin__th">Genre</th>
                <th className="song-admin__th">Listens</th>
              </tr>
            </thead>
            <tbody>
              {sortedSongs.length > 0 ? (
                sortedSongs.map((song) => (
                  <tr
                    key={song._id}
                    className={`song-admin__row ${
                      selected.includes(song._id)
                        ? "song-admin__row--selected"
                        : ""
                    }`}
                    onClick={() => setModal({ ...emptyForm, ...song })}
                  >
                    <td className="song-admin__td td-box">
                      <input
                        type="checkbox"
                        checked={selected.includes(song._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(song._id)}
                      />
                    </td>

                    <td className="song-admin__td ">
                      <img
                        className="song-admin__thumb"
                        src={song.imageUrl || "https://picsum.photos/48"}
                        alt={song.title}
                      />
                    </td>

                    <td className="song-admin__td td-title">{song.title}</td>
                    <td className="song-admin__td td-artist ">
                      {splitArtists(song.artist).length > 0
                        ? splitArtists(song.artist).map((a) => (
                            <span key={a} className="song-admin__artist-badge">
                              {a}
                            </span>
                          ))
                        : "—"}
                    </td>

                    <td className="song-admin__td td-genre">
                      {splitGenres(song.genre).length > 0
                        ? splitGenres(song.genre).map((g) => (
                            <span key={g} className="song-admin__genre-badge">
                              {g}
                            </span>
                          ))
                        : "—"}
                    </td>
                    <td className="song-admin__td td-listen">{song.plays}</td>
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
      )}

      {modal && (
        <SongModal
          key={modal?._id || "new-song"}
          song={modal}
          token={token}
          onClose={() => setModal(null)}
          onSaved={fetchSongs}
        />
      )}
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
