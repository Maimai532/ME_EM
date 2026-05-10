import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const styles = {
  container: { padding: "20px" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1e3a5f",
  },

  btnAdd: {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: 1,
    minWidth: "260px",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
  },

  select: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "10px 12px",
    backgroundColor: "#dbe8f6",
    color: "#1e3a5f",
    fontSize: "14px",
  },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  btnEdit: {
    padding: "4px 10px",
    marginRight: "8px",
    backgroundColor: "#f0f9ff",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    color: "#2563eb",
    cursor: "pointer",
  },

  btnDel: {
    padding: "4px 10px",
    backgroundColor: "#fff0f0",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    color: "#dc2626",
    cursor: "pointer",
  },

  img: {
    width: "48px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "6px",
    backgroundColor: "#e5e7eb",
  },

  preview: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    marginTop: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f3f4f6",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },

  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "28px",
    width: "480px",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#1e3a5f",
  },

  label: {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "4px",
    marginTop: "12px",
  },

  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  radioGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "4px",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  btnCancel: {
    padding: "8px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
  },

  btnSave: {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

const emptyForm = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  duration: "",
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
    duration: input.duration ?? "",
    audioUrl: input.audioUrl ?? "",
    imageUrl: input.imageUrl ?? "",
    sourceType: input.sourceType ?? "url",
    _id: input._id,
  };
}

function SongModal({ song, onClose, onSaved, token }) {
  const safeSong = normalizeSongForm({ ...emptyForm, ...(song || {}) });
  const isEdit = !!safeSong._id;

  const [form, setForm] = useState(safeSong);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    safeSong.imageUrl || "",
  );

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

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "sourceType") {
      if (value === "url") {
        setAudioFile(null);
      }

      setForm((prev) => ({
        ...prev,
        sourceType: value,
        audioUrl: value === "upload" ? "" : prev.audioUrl,
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

        isEdit
          ? await axios.put(
              `${API_URL}/songs/${safeSong._id}`,
              fd,
              config,
            )
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
      onClose();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Có lỗi xảy ra",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>
          {isEdit ? "Sửa bài hát" : "Thêm bài hát"}
        </h2>

        <label style={styles.label}>Tên bài hát *</label>
        <input
          style={styles.input}
          name="title"
          value={form.title || ""}
          onChange={handleChange}
        />

        <label style={styles.label}>Nghệ sĩ *</label>
        <input
          style={styles.input}
          name="artist"
          value={form.artist || ""}
          onChange={handleChange}
        />

        <label style={styles.label}>Album</label>
        <input
          style={styles.input}
          name="album"
          value={form.album || ""}
          onChange={handleChange}
        />

        <label style={styles.label}>Thể loại</label>
        <input
          style={styles.input}
          name="genre"
          value={form.genre || ""}
          onChange={handleChange}
        />

        <label style={styles.label}>Thời lượng</label>
        <input
          style={styles.input}
          name="duration"
          type="number"
          value={form.duration ?? ""}
          onChange={handleChange}
        />

        <label style={styles.label}>Audio</label>

        <div style={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="sourceType"
              value="url"
              checked={
                (form.sourceType || "url") === "url"
              }
              onChange={handleChange}
            />{" "}
            URL
          </label>

          <label>
            <input
              type="radio"
              name="sourceType"
              value="upload"
              checked={
                (form.sourceType || "url") === "upload"
              }
              onChange={handleChange}
            />{" "}
            Upload
          </label>
        </div>

        {(form.sourceType || "url") === "url" ? (
          <input
            style={{
              ...styles.input,
              marginTop: "8px",
            }}
            name="audioUrl"
            value={form.audioUrl || ""}
            onChange={handleChange}
            placeholder="https://..."
          />
        ) : (
          <input
            style={{
              ...styles.input,
              marginTop: "8px",
            }}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file =
                e.target.files?.[0] || null;

              setAudioFile(file);

              if (file) {
                setForm((prev) => ({
                  ...prev,
                  sourceType: "upload",
                  audioUrl: "",
                }));
              }
            }}
          />
        )}

        <label style={styles.label}>Ảnh bìa</label>

        <input
          style={styles.input}
          name="imageUrl"
          value={form.imageUrl || ""}
          onChange={handleChange}
          placeholder="https://..."
        />

        <input
          style={{
            ...styles.input,
            marginTop: "6px",
          }}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file =
              e.target.files?.[0] || null;

            setImageFile(file);

            if (file) {
              setForm((prev) => ({
                ...prev,
                imageUrl: "",
              }));
            }
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            style={styles.preview}
          />
        )}

        <div style={styles.modalFooter}>
          <button
            style={styles.btnCancel}
            onClick={onClose}
          >
            Huỷ
          </button>

          <button
            style={styles.btnSave}
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

function Song_Admin() {
  const { token } = useAuth();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState([]);

  // SEARCH + FILTER
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] =
    useState("");

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
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelected(
      selected.length === songs.length
        ? []
        : songs.map((s) => s._id),
    );
  }

  async function handleDelete(id) {
    if (!window.confirm("Xoá bài hát này?"))
      return;

    try {
      await axios.delete(
        `${API_URL}/songs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchSongs();
    } catch {
      alert("Xoá thất bại");
    }
  }

  async function handleDeleteSelected() {
    if (
      !window.confirm(
        `Xoá ${selected.length} bài hát?`,
      )
    )
      return;

    try {
      await Promise.all(
        selected.map((id) =>
          axios.delete(
            `${API_URL}/songs/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ),
      );

      setSelected([]);
      fetchSongs();
    } catch {
      alert("Có lỗi khi xoá");
    }
  }

  // GENRES
  const genres = [
    ...new Set(
      songs.map((s) => s.genre).filter(Boolean),
    ),
  ];

  // FILTERED SONGS
  const filteredSongs = songs.filter(
    (song) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        song.title
          ?.toLowerCase()
          .includes(keyword) ||
        song.artist
          ?.toLowerCase()
          .includes(keyword);

      const matchGenre =
        !genreFilter ||
        song.genre === genreFilter;

      return matchSearch && matchGenre;
    },
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          Quản lý bài hát
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {selected.length > 0 && (
            <button
              style={{
                ...styles.btnAdd,
                backgroundColor: "#dc2626",
              }}
              onClick={handleDeleteSelected}
            >
              Xoá {selected.length} bài
            </button>
          )}

          <button
            style={styles.btnAdd}
            onClick={() =>
              setModal(emptyForm)
            }
          >
            + Thêm bài hát
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Tìm tên bài hát hoặc nghệ sĩ..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={styles.searchInput}
        />

        <select
          value={genreFilter}
          onChange={(e) =>
            setGenreFilter(e.target.value)
          }
          style={styles.select}
        >
          <option value="">
            Tất cả thể loại
          </option>

          {genres.map((genre) => (
            <option
              key={genre}
              value={genre}
            >
              {genre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  checked={
                    selected.length ===
                      songs.length &&
                    songs.length > 0
                  }
                  onChange={
                    toggleSelectAll
                  }
                />
              </th>

              <th style={styles.th}>
                Ảnh
              </th>

              <th style={styles.th}>
                Tên bài
              </th>

              <th style={styles.th}>
                Nghệ sĩ
              </th>

              <th style={styles.th}>
                Thể loại
              </th>

              <th style={styles.th}>
                Lượt nghe
              </th>

              <th style={styles.th}>
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSongs.length >
            0 ? (
              filteredSongs.map(
                (song) => (
                  <tr
                    key={song._id}
                    style={{
                      backgroundColor:
                        selected.includes(
                          song._id,
                        )
                          ? "#eff6ff"
                          : "white",
                    }}
                  >
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selected.includes(
                          song._id,
                        )}
                        onChange={() =>
                          toggleSelect(
                            song._id,
                          )
                        }
                      />
                    </td>

                    <td style={styles.td}>
                      <img
                        style={styles.img}
                        src={
                          song.imageUrl ||
                          "https://picsum.photos/48"
                        }
                        alt={song.title}
                      />
                    </td>

                    <td style={styles.td}>
                      {song.title}
                    </td>

                    <td style={styles.td}>
                      {song.artist}
                    </td>

                    <td style={styles.td}>
                      {song.genre ||
                        "—"}
                    </td>

                    <td style={styles.td}>
                      {song.plays}
                    </td>

                    <td style={styles.td}>
                      <button
                        style={
                          styles.btnEdit
                        }
                        onClick={() =>
                          setModal({
                            ...emptyForm,
                            ...song,
                          })
                        }
                      >
                        Sửa
                      </button>

                      <button
                        style={
                          styles.btnDel
                        }
                        onClick={() =>
                          handleDelete(
                            song._id,
                          )
                        }
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign:
                      "center",
                    padding: "24px",
                    color: "#6b7280",
                  }}
                >
                  Không tìm thấy bài hát
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modal && (
        <SongModal
          key={
            modal?._id ||
            "new-song"
          }
          song={modal}
          token={token}
          onClose={() =>
            setModal(null)
          }
          onSaved={fetchSongs}
        />
      )}
    </div>
  );
}

export default Song_Admin;