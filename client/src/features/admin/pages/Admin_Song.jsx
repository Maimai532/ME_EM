import axios from "axios";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/hooks/useToast";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Songs.css";
import { API_URL } from "../../../shared/constants/api";
import { useState, useEffect, useRef } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { Music, Image } from "lucide-react";

const emptyForm = {
  title: "",
  artist: "",
  album: "",
  albumId: "",
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
    albumId: input.albumId ?? "",
    genre: input.genre ?? "",
    audioUrl: input.audioUrl ?? "",
    audioKey: input.audioKey ?? "",
    imageUrl: input.imageUrl ?? "",
    coverUrl: input.coverUrl ?? input.imageUrl ?? "",
    sourceType,
    _id: input._id,
  };
}

function CustomSelect({ value, onChange, options, disabled = false }) {
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
        disabled={disabled}
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

function DetailForm({
  song,
  token,
  onSaved,
  onClose,
  onDelete,
  externalLoading = false,
}) {
  const safeSong = normalizeSongForm({ ...emptyForm, ...(song || {}) });
  const isEdit = !!safeSong._id;
  const { showToast } = useToast();

  const [audioMethod, setAudioMethod] = useState("upload");
  const [audioFile, setAudioFile] = useState(null);

  const [imageMethod, setImageMethod] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safeSong.coverUrl || "");
  const [removeImage, setRemoveImage] = useState(false);

  const [albums, setAlbums] = useState([]);
  const [artistsList, setArtistsList] = useState([]);
  const [showAlbumTextSuggest, setShowAlbumTextSuggest] = useState(false);

  const [form, setForm] = useState(safeSong);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(!isEdit);
  const isBusy = loading || externalLoading;

  useEffect(() => {
    axios
      .get(`${API_URL}/albums`)
      .then((res) => setAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    axios
      .get(`${API_URL}/artists`)
      .then((res) => setArtistsList(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const s = normalizeSongForm({ ...emptyForm, ...(song || {}) });
    setForm(s);
    setAudioFile(null);
    setImageFile(null);
    setImagePreview(s.coverUrl || "");
    setIsDirty(!s._id);

    if (s._id && (s.audioUrl || s.audioKey)) {
      setAudioMethod(s.audioUrl ? "url" : "b2key");
    } else {
      setAudioMethod("upload");
    }

    if (s._id && (s.imageUrl || s.coverUrl)) {
      setImageMethod("url");
    } else {
      setImageMethod("upload");
    }
  }, [song?._id, song]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (imageMethod === "url") {
      setImagePreview(form.imageUrl || form.coverUrl || "");
      return;
    }
    setImagePreview(form.coverUrl || "");
  }, [imageFile, imageMethod, form.imageUrl, form.coverUrl]);

  const typedArtistNames = splitArtists(form.artist);
  const matchedArtist = typedArtistNames.length
    ? artistsList.find((a) =>
        typedArtistNames.some(
          (name) => name.toLowerCase() === a.name.toLowerCase(),
        ),
      )
    : null;
  const artistLocked = !form.artist.trim();
  const albumsOfArtist = matchedArtist
    ? albums.filter((a) => {
        const albumArtistId =
          a.artistId && typeof a.artistId === "object"
            ? a.artistId._id
            : a.artistId;
        return String(albumArtistId || "") === String(matchedArtist._id);
      })
    : [];

  useEffect(() => {
    if (!form.albumId) return;
    const stillValid = albumsOfArtist.some((a) => a._id === form.albumId);
    if (!stillValid) {
      setForm((p) => ({ ...p, album: "", albumId: "" }));
    }
  }, [matchedArtist?._id]);

  const albumLocked = artistLocked || !matchedArtist;
  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    setImageMethod("upload");
    setForm((p) => ({ ...p, imageUrl: "", coverUrl: "" }));
    setRemoveImage(true);
    setIsDirty(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
    setIsDirty(true);
  }

  function handleAudioMethodChange(method) {
    setAudioMethod(method);
    setAudioFile(null);
    setForm((prev) => ({
      ...prev,
      sourceType: method,
      audioUrl: method === "url" ? prev.audioUrl : "",
      audioKey: method === "b2key" ? prev.audioKey : "",
    }));
    setIsDirty(true);
  }

  function handleImageMethodChange(method) {
    setImageMethod(method);
    setImageFile(null);
    if (method !== "url") {
      setForm((prev) => ({ ...prev, imageUrl: "" }));
    }
    setIsDirty(true);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "coverUrl" || k === "_id") return;
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (audioFile) fd.append("audio", audioFile);
      if (imageFile) fd.append("image", imageFile);
      if (removeImage && !imageFile) fd.append("removeImage", "true");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      let res;
      if (isEdit) {
        res = await axios.put(`${API_URL}/songs/${safeSong._id}`, fd, config);
      } else {
        res = await axios.post(`${API_URL}/songs`, fd, config);
      }

      showToast(isEdit ? "Đã lưu thay đổi!" : "Đã tạo!", "success");
      onSaved(res.data.data);
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

  const imageExistingLabel = () => {
    if (form.imageUrl) return `URL: ${form.imageUrl}`;
    if (form.coverUrl) return `URL: ${form.coverUrl}`;
    return null;
  };

  const hasExistingAudio =
    isEdit && (form.audioUrl || form.audioKey) && !audioFile;
  const hasExistingImage =
    isEdit && (form.coverUrl || form.imageUrl) && !imageFile;

  const audioOptions = [
    { value: "upload", label: "Upload" },
    { value: "url", label: "URL" },
    { value: "b2key", label: "B2 Key" },
  ];

  const imageOptions = [
    { value: "upload", label: "Upload" },
    { value: "url", label: "URL" },
  ];

  return (
    <div className="song-admin__detail-form">
      {isBusy && <div className="song-admin__detail-overlay" />}
      <fieldset
        disabled={isBusy}
        style={{ border: "none", padding: 0, margin: 0 }}
      >
        <div className="song-admin__detail-title">
          {isEdit ? "Chi tiết" : "New song"}
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
                  onClick={clearImage}
                  disabled={isBusy}
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
                    if (file) {
                      setImageFile(file);
                      setImageMethod("upload");
                      setForm((p) => ({
                        ...p,
                        imageUrl: "",
                        coverUrl: "",
                      }));
                      setIsDirty(true);
                    }
                  }}
                  disabled={isBusy}
                />
                <span className="song-admin__preview-placeholder-icon">
                  <Image size={28} />
                </span>
                <span>Chọn ảnh</span>
              </label>
            )}
          </div>
          {/* form */}
          <div className="song-admin__detail-fields-col">
            <label className="song-admin__label">
              Tên bài hát <span>*</span>
            </label>
            <input
              className="song-admin__input"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={isBusy}
            />

            <label className="song-admin__label">
              Nghệ sĩ <span>*</span>
            </label>
            <input
              className="song-admin__input"
              name="artist"
              value={form.artist}
              onChange={handleChange}
              disabled={isBusy}
            />

            <label className="song-admin__label">Album</label>
            <div style={{ position: "relative" }}>
              <input
                className="song-admin__input"
                name="album"
                value={form.album}
                onChange={(e) => {
                  handleChange(e);
                  setForm((p) => ({ ...p, albumId: "" }));
                  setShowAlbumTextSuggest(true);
                }}
                onFocus={() => setShowAlbumTextSuggest(true)}
                onBlur={() =>
                  setTimeout(() => setShowAlbumTextSuggest(false), 150)
                }
                placeholder={
                  artistLocked
                    ? "Nhập nghệ sĩ trước..."
                    : !matchedArtist
                      ? "Nghệ sĩ chưa có trong hệ thống"
                      : "Nhập tên album..."
                }
                autoComplete="off"
                disabled={isBusy || albumLocked}
              />
              {!albumLocked && showAlbumTextSuggest && (
                <ul className="song-admin__album-dropdown">
                  {albumsOfArtist.length > 0 ? (
                    albumsOfArtist
                      .filter((a) =>
                        form.album.trim()
                          ? a.title
                              .toLowerCase()
                              .includes(form.album.trim().toLowerCase())
                          : true,
                      )
                      .map((a) => (
                        <li
                          key={a._id}
                          className="song-admin__album-option"
                          onMouseDown={() => {
                            setForm((p) => ({
                              ...p,
                              album: a.title,
                              albumId: a._id,
                            }));
                            setShowAlbumTextSuggest(false);
                            setIsDirty(true);
                            if (!imageFile && imageMethod !== "url") {
                              setImagePreview(a.coverImage || "");
                            }
                          }}
                        >
                          {a.coverImage && (
                            <img
                              src={a.coverImage}
                              alt=""
                              className="song-admin__album-option-cover"
                            />
                          )}
                          {a.title}
                        </li>
                      ))
                  ) : (
                    <li className="song-admin__album-option song-admin__album-option--empty">
                      {matchedArtist.name} chưa có album nào — vào trang Artist
                      để tạo album mới
                    </li>
                  )}
                </ul>
              )}
              <span className="song-admin__hint-text">
                {artistLocked
                  ? "Cần nhập nghệ sĩ trước khi chọn album"
                  : !matchedArtist
                    ? "Nghệ sĩ chưa tồn tại trong hệ thống — tạo nghệ sĩ trước khi gán album"
                    : "Ảnh bìa sẽ tự động lấy theo album bạn chọn"}
              </span>
            </div>

            <label className="song-admin__label">
              Thể loại <span>*</span>
            </label>
            <input
              className="song-admin__input"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>
        </div>

        <label className="song-admin__label">
          Audio <span>*</span>
        </label>
        <div className="song-admin__media-row">
          <CustomSelect
            value={audioMethod}
            onChange={handleAudioMethodChange}
            options={audioOptions}
            disabled={isBusy}
          />

          <div className="song-admin__media-content">
            {audioMethod === "upload" && (
              <label className="song-admin__upload-area">
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setAudioFile(file);
                      setForm((p) => ({ ...p, audioUrl: "", audioKey: "" }));
                      setIsDirty(true);
                    }
                  }}
                />
                {hasExistingAudio || audioFile ? (
                  <>
                    <i className="ti ti-file-music" aria-hidden="true" />
                    <span className="file-name">
                      {audioFile
                        ? audioFile.name
                        : form.audioKey?.trim() || form.audioUrl?.trim()}
                    </span>
                    <span className="song-admin__change-hint">Nhấn để đổi</span>
                    {audioFile && (
                      <button
                        type="button"
                        className="song-admin__file-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAudioFile(null);
                        }}
                      >
                        Xoá
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <i className="ti ti-upload" aria-hidden="true" />
                    <span>Nhấn để chọn file audio</span>
                  </>
                )}
              </label>
            )}

            {audioMethod === "url" && (
              <input
                className="song-admin__input"
                name="audioUrl"
                value={form.audioUrl}
                onChange={handleChange}
                placeholder="Nhấn để nhập URL audio"
                style={{ marginTop: 0 }}
              />
            )}

            {audioMethod === "b2key" && (
              <input
                className="song-admin__input"
                name="audioKey"
                value={form.audioKey}
                onChange={handleChange}
                placeholder="Nhấn để nhập B2 Key"
                style={{ marginTop: 0 }}
              />
            )}
          </div>
        </div>

        <label className="song-admin__label" style={{ marginTop: "12px" }}>
          Ảnh bìa
        </label>
        <div className="song-admin__media-row">
          <CustomSelect
            value={imageMethod}
            onChange={handleImageMethodChange}
            options={imageOptions}
            disabled={isBusy}
          />

          <div className="song-admin__media-content">
            {imageMethod === "upload" && (
              <label className="song-admin__upload-area">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setImageFile(file);
                      setForm((p) => ({
                        ...p,
                        imageUrl: "",
                        coverUrl: "",
                      }));
                      setIsDirty(true);
                    }
                  }}
                  disabled={isBusy}
                />
                {hasExistingImage || imageFile ? (
                  <>
                    <i className="ti ti-file-image" aria-hidden="true" />
                    <span className="file-name">
                      {imageFile
                        ? imageFile.name
                        : imageExistingLabel() || "Đã có ảnh"}
                    </span>
                    <span className="song-admin__change-hint">Nhấn để đổi</span>
                    {imageFile && (
                      <button
                        type="button"
                        className="song-admin__file-remove"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearImage();
                        }}
                        disabled={isBusy}
                      >
                        Xoá
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <i className="ti ti-upload" aria-hidden="true" />
                    <span>Nhấn để chọn ảnh bìa</span>
                  </>
                )}
              </label>
            )}

            {imageMethod === "url" && (
              <input
                className="song-admin__input"
                name="imageUrl"
                value={form.imageUrl}
                onChange={(e) => {
                  handleChange(e);
                  setImagePreview(e.target.value);
                }}
                placeholder="Nhập URL"
                disabled={isBusy}
              />
            )}
          </div>
        </div>

        <div className="song-admin__form-footer">
          {isEdit && (
            <button
              type="button"
              className="song-admin__btn-del-song"
              onClick={onDelete}
              disabled={isBusy}
            >
              Xoá
            </button>
          )}
          <button
            type="button"
            className="song-admin__btn-cancel"
            onClick={onClose}
            disabled={isBusy}
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
      </fieldset>
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
  const [deleting, setDeleting] = useState(false);
  const tableRef = useRef(null);
  const [albums, setAlbums] = useState([]);
  const [artistsList, setArtistsList] = useState([]);
  const [showAlbumTextSuggest, setShowAlbumTextSuggest] = useState(false);

  useEffect(() => {
    document.title = "Songs Management";
  }, []);
  useEffect(() => {
    axios
      .get(`${API_URL}/albums`)
      .then((res) => setAlbums(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    axios
      .get(`${API_URL}/artists`)
      .then((res) => setArtistsList(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

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

  function handleSaved(savedSong) {
    if (!savedSong?._id) return;
    setSongs((prev) => {
      const exists = prev.some((s) => s._id === savedSong._id);
      return exists
        ? prev.map((s) => (s._id === savedSong._id ? savedSong : s))
        : [savedSong, ...prev];
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
      (missingFilter === "image" &&
        !song.coverUrl?.trim() &&
        // !song.imageKey?.trim() &&
        !song.imageUrl?.trim()) ||
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
        setDeleting(true);
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
          showToast("Có lỗi khi xoá", "error");
        } finally {
          setDeleting(false);
          setConfirm(null);
        }
      },
    });
  }

  function handleDeleteSingle() {
    if (!activeSong?._id) return;
    setConfirm({
      message: `Xoá "${activeSong.title || "bài hát này"}"?`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await axios.delete(`${API_URL}/songs/${activeSong._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setActiveSong(null);
          fetchSongs();
          showToast("Đã xoá", "success");
        } catch {
          showToast("Có lỗi khi xoá", "error");
        } finally {
          setDeleting(false);
          setConfirm(null);
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
        <div className="song-admin__left">
          {/* <div className="song-admin__meta">
            Songs <span>{songs.length}</span>
          </div> */}

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

          <DetailForm
            key={activeSong?._id ?? "new-or-empty"}
            song={activeSong}
            token={token}
            onSaved={(savedSong) => {
              handleSaved(savedSong);
              setActiveSong(null);
            }}
            onClose={() => setActiveSong(null)}
            onDelete={handleDeleteSingle}
            externalLoading={deleting}
          />
        </div>

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
                      <col className="song-admin__col-img" />
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
                        <th className="song-admin__th">IMG</th>
                        <th className="song-admin__th">Name</th>
                        <th className="song-admin__th">Artists</th>
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
                            <td className="song-admin__td">
                              {song.coverUrl ? (
                                <img
                                  src={song.coverUrl}
                                  alt={song.title}
                                  className="song-admin__cover"
                                />
                              ) : (
                                <div className="song-admin__cover song-admin__cover--empty">
                                  {/* <Repeat size={18} /> */}
                                  <Music size={18} />
                                </div>
                              )}
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
          loading={deleting}
        />
      )}
    </AdminPage>
  );
}

export default Admin_Song;
