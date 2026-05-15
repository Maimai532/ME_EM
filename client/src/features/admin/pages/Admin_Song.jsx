import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth/context/AuthContext";
import { useToast } from "../../../shared/hooks/useToast";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Songs.css";
import { API_URL } from "../../../shared/constants/api";

const emptyForm = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  audioUrl: "",
  imageUrl: "",
  sourceType: "url",
};

function normalizeSongForm(input = {}) {
  return {
    title: input.title ?? "",
    artist: input.artist ?? "",
    album: input.album ?? "",
    genre: input.genre ?? "",
    audioUrl: input.audioUrl ?? "",
    imageUrl: input.imageUrl ?? "",
    sourceType: input.sourceType ?? "url",
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
      if (value === "url") setAudioFile(null);
      setForm((prev) => ({
        ...prev,
        sourceType: value,
        audioUrl: value === "upload" ? "" : prev.audioUrl,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value ?? "" }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      if (audioFile || imageFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        if (audioFile) fd.append("audio", audioFile);
        if (imageFile) fd.append("image", imageFile);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        isEdit
          ? await axios.put(`${API_URL}/songs/${safeSong._id}`, fd, config)
          : await axios.post(`${API_URL}/songs`, fd, config);
      } else {
        isEdit
          ? await axios.put(
              `${API_URL}/songs/${safeSong._id}`,
              form,
              authHeader,
            )
          : await axios.post(`${API_URL}/songs`, form, authHeader);
      }
      onSaved();
      showToast(
        isEdit ? "Cập nhật thành công!" : "Thêm bài hát thành công!",
        "success",
      );
      onClose();
    } catch {
      showToast("Có lỗi xảy ra!", "error");
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
                  value="url"
                  checked={(form.sourceType || "url") === "url"}
                  onChange={handleChange}
                />{" "}
                URL
              </label>
              <label>
                <input
                  type="radio"
                  name="sourceType"
                  value="upload"
                  checked={(form.sourceType || "url") === "upload"}
                  onChange={handleChange}
                />{" "}
                Upload
              </label>
            </div>

            {(form.sourceType || "url") === "url" ? (
              <input
                className="song-admin__input song-admin__input--mt-sm"
                name="audioUrl"
                value={form.audioUrl || ""}
                onChange={handleChange}
                placeholder="https://..."
              />
            ) : (
              <input
                className="song-admin__input song-admin__input--mt-sm"
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAudioFile(file);
                  if (file)
                    setForm((prev) => ({
                      ...prev,
                      sourceType: "upload",
                      audioUrl: "",
                    }));
                }}
              />
            )}

            <label className="song-admin__label">Ảnh bìa</label>
            <input
              className="song-admin__input"
              name="imageUrl"
              value={form.imageUrl || ""}
              onChange={handleChange}
              placeholder="https://..."
            />

            <input
              className="song-admin__input song-admin__input--mt-xs"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setForm((prev) => ({ ...prev, imageUrl: "" }));
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="song-admin__preview"
              />
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

  async function handleDelete(id) {
    setConfirm({
      message: "Xoá bài hát này?",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await axios.delete(`${API_URL}/songs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchSongs();
          showToast("Đã xoá bài hát!", "success");
        } catch {
          alert("Xoá thất bại");
        }
      },
    });
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

  const genres = [...new Set(songs.map((s) => s.genre).filter(Boolean))];
  const filteredSongs = songs.filter((song) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      song.title?.toLowerCase().includes(keyword) ||
      song.artist?.toLowerCase().includes(keyword);
    const matchGenre = !genreFilter || song.genre === genreFilter;
    return matchSearch && matchGenre;
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
      <div className="song-admin-meta">Songs: <span>{songs.length}</span> </div>
      <div className="song-admin__filter-bar">
        <input
          type="text"
          placeholder="Tìm tên bài hát/nghệ sĩ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="song-admin__search-input"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="song-admin__select"
        >
          <option value="">All</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="song-admin__table-wrapper">
          <table className="song-admin__table">
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
                <th className="song-admin__th">Number of listens</th>
                <th className="song-admin__th">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <tr
                    key={song._id}
                    className={
                      selected.includes(song._id)
                        ? "song-admin__row--selected"
                        : ""
                    }
                  >
                    <td className="song-admin__td">
                      <input
                        type="checkbox"
                        checked={selected.includes(song._id)}
                        onChange={() => toggleSelect(song._id)}
                      />
                    </td>
                    <td className="song-admin__td">
                      <img
                        className="song-admin__thumb"
                        src={song.imageUrl || "https://picsum.photos/48"}
                        alt={song.title}
                      />
                    </td>
                    <td className="song-admin__td">{song.title}</td>
                    <td className="song-admin__td">{song.artist}</td>
                    <td className="song-admin__td">{song.genre || "—"}</td>
                    <td className="song-admin__td">{song.plays}</td>
                    <td className="song-admin__td">
                      <button
                        type="button"
                        className="song-admin__btn-edit"
                        onClick={() => setModal({ ...emptyForm, ...song })}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="song-admin__btn-del"
                        onClick={() => handleDelete(song._id)}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="song-admin__empty-cell">
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
