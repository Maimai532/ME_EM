
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { artistService } from "../../../shared/services/artist.service";
import { songService } from "../../home/services/songService";
import { useToast } from "../../../shared/hooks/useToast";
import { useAuth } from "../../auth/context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Artist.css";
import { albumService } from "../../../shared/services/album.service";

function splitArtists(artistStr) {
  if (!artistStr) return [];
  return artistStr
    .split(/,|\/| và /)
    .map((a) => a.trim())
    .filter(Boolean);
}

function ArtistForm({ artist, onSaved, onCancel }) {
  const isEdit = !!artist;
  const [form, setForm] = useState({
    name: artist?.name || "",
    country: artist?.country || "",
    description: artist?.description || "",
    avatarUrl: artist?.avatar || "",
  });
  const [avatarMode, setAvatarMode] = useState("url");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(artist?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [autoLinked, setAutoLinked] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    setForm({
      name: artist?.name || "",
      country: artist?.country || "",
      description: artist?.description || "",
      avatarUrl: artist?.avatar || "",
    });
    setPreview(artist?.avatar || "");
    setAvatarFile(null);
    setAvatarMode("url");
  }, [artist]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "avatarUrl") setPreview(value);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    console.log("File đã chọn:", file.name, file.size);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.name.trim()) return alert("Tên nghệ sĩ không được trống");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("country", form.country);
      formData.append("description", form.description);

      if (avatarMode === "file" && avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (avatarMode === "url" && form.avatarUrl) {
        formData.append("avatarUrl", form.avatarUrl);
      }
      console.log("avatarMode:", avatarMode);
      console.log("avatarFile:", avatarFile);
      for (let [key, val] of formData.entries()) {
        console.log(key, val);
      }

      if (isEdit) {
        await artistService.update(artist._id, formData);
        onSaved();
      } else {
        const res = await artistService.create(formData);
        const linked = res.data.autoLinked || 0;
        if (linked > 0) {
          setAutoLinked(linked);
          setLoading(false);
          setTimeout(onSaved, 2000);
        } else {
          onSaved();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (
        msg.includes("đã tồn tại") ||
        msg.includes("duplicate") ||
        err.response?.status === 400
      ) {
        showToast("Nghệ sĩ này đã tồn tại!", "warning");
      } else {
        showToast("Lỗi khi lưu nghệ sĩ", "error");
      }
      setLoading(false);
    }
  };

  return (
    <div className="artist-form">
      {autoLinked !== null && (
        <div className="alert alert--success">
          Đã liên kết {autoLinked} bài hát có sẵn vào nghệ sĩ này!
        </div>
      )}

      <form onSubmit={handleSubmit} className="artist-form__body">
        <div className="form-group-avtar">
          <div className="avatar-mode-toggle">
            <label>Avatar</label>
            <div className="mode">
              <button
                type="button"
                className={avatarMode === "url" ? "active" : ""}
                onClick={() => setAvatarMode("url")}
              >
                URL
              </button>
              <button
                type="button"
                className={avatarMode === "file" ? "active" : ""}
                onClick={() => setAvatarMode("file")}
              >
                Upload
              </button>
            </div>

            {avatarMode === "url" ? (
              <input
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder="https://i.imgur.com/abc.jpg"
              />
            ) : (
              <input type="file" accept="image/*" onChange={handleFile} />
            )}
          </div>

          <div className="avatar-mode-preview">
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="artist-form__preview"
                onError={() => setPreview("")}
              />
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Tên nghệ sĩ *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Quốc gia</label>
          <input name="country" value={form.country} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Giới thiệu về nghệ sĩ..."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo nghệ sĩ"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddAlbumModal({ artistId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    releaseYear: "",
    description: "",
  });
  const [coverMode, setCoverMode] = useState("url");
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e) => {
    setCoverUrl(e.target.value);
    setPreview(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Thiếu tên album");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("releaseYear", form.releaseYear);
      formData.append("description", form.description);

      if (coverMode === "file" && coverFile) {
        formData.append("coverImage", coverFile);
      } else if (coverMode === "url" && coverUrl) {
        formData.append("coverImage", coverUrl);
      }

      await artistService.addAlbum(artistId, formData);
      onSaved();
    } catch (err) {
      showToast("Lỗi khi tạo album", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        id="album-form"
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal__header">
          <h3>New Album</h3>
        </div>

        <div className="modal__body">
          <div className="form-group">
            <label>Tên album *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Năm phát hành</label>
            <input
              type="number"
              value={form.releaseYear ?? ""}
              onChange={(e) =>
                setForm({ ...form, releaseYear: e.target.value })
              }
              placeholder="2024"
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Ảnh bìa album</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setCoverMode("url");
                  setCoverFile(null);
                  setPreview(coverUrl);
                }}
                style={{ fontWeight: coverMode === "url" ? 700 : 400 }}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setCoverMode("file");
                  setCoverUrl("");
                  setPreview("");
                }}
                style={{ fontWeight: coverMode === "file" ? 700 : 400 }}
              >
                Upload file
              </button>
            </div>

            {coverMode === "url" ? (
              <input
                value={coverUrl}
                onChange={handleUrlChange}
                placeholder="https://..."
              />
            ) : (
              <input type="file" accept="image/*" onChange={handleFileChange} />
            )}

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="artist-album__preview"
                onError={() => setPreview("")}
              />
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo album"}
          </button>
        </div>
      </form>
    </div>
  );
}
function EditAlbumModal({ album, artistId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: album.title || "",
    releaseYear: album.releaseYear || "",
    description: album.description || "",
  });
  const [coverMode, setCoverMode] = useState("url");
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(album.coverImage || "");
  const [preview, setPreview] = useState(album.coverImage || "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setForm({
      title: album.title || "",
      releaseYear: album.releaseYear || "",
      description: album.description || "",
    });
    setCoverUrl(album.coverImage || "");
    setPreview(album.coverImage || "");
    setCoverFile(null);
    setCoverMode("url");
  }, [album]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e) => {
    setCoverUrl(e.target.value);
    setPreview(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Thiếu tên album");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        releaseYear: form.releaseYear,
        description: form.description,
        coverImage: coverMode === "url" ? coverUrl : undefined,
      };
      await albumService.update(album._id, payload);
      onSaved();
    } catch (err) {
      showToast("Lỗi khi cập nhật album", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal__header">
          <h3>Sửa album</h3>
        </div>

        <div className="modal__body">
          <div className="form-group">
            <label>Tên album *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Năm phát hành</label>
            <input
              type="number"
              value={form.releaseYear ?? ""}
              onChange={(e) =>
                setForm({ ...form, releaseYear: e.target.value })
              }
              placeholder="2024"
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Ảnh bìa album</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setCoverMode("url");
                  setCoverFile(null);
                  setPreview(coverUrl);
                }}
                style={{ fontWeight: coverMode === "url" ? 700 : 400 }}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setCoverMode("file");
                  setCoverUrl("");
                  setPreview("");
                }}
                style={{ fontWeight: coverMode === "file" ? 700 : 400 }}
              >
                Upload file
              </button>
            </div>

            {coverMode === "url" ? (
              <input
                value={coverUrl}
                onChange={handleUrlChange}
                placeholder="https://..."
              />
            ) : (
              <input type="file" accept="image/*" onChange={handleFileChange} />
            )}

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="artist-album__preview"
                onError={() => setPreview("")}
              />
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật album"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddSongModal({ artistId, albumId, onClose, onSaved }) {
  const [tab, setTab] = useState("existing");
  const [allSongs, setAllSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSongIds, setSelectedSongIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [newSong, setNewSong] = useState({
    title: "",
    album: "",
    genre: "",
    audioUrl: "",
    imageUrl: "",
    sourceType: "url",
  });

  useEffect(() => {
    songService.getAll().then((res) => setAllSongs(res.data));
  }, []);

  const toggleSong = (id) => {
    setSelectedSongIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredSongs = allSongs.filter((s) => {
    const q = search.toLowerCase();
    const matchTitle = s.title?.toLowerCase().includes(q);
    const matchArtist = s.artist
      ?.split(/,| và /)
      .map((a) => a.trim())
      .some((a) => a.toLowerCase().includes(q));
    return matchTitle || matchArtist;
  });

  const handleAddExisting = async () => {
    if (selectedSongIds.size === 0) return alert("Chọn ít nhất một bài hát");
    setLoading(true);
    try {
      await Promise.all(
        [...selectedSongIds].map((songId) =>
          artistService.addExistingSong(artistId, songId, albumId),
        ),
      );
      onSaved();
    } catch (err) {
      showToast("Lỗi khi thêm bài hát", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newSong.title) return alert("Thiếu tiêu đề");
    if (newSong.sourceType === "url" && !newSong.audioUrl)
      return alert("Thiếu link ");

    setLoading(true);
    try {
      await artistService.createNewSong(artistId, { ...newSong, albumId });
      onSaved();
    } catch (err) {
      showToast("Lỗi khi tạo bài hát", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>Thêm bài hát</h3>
          <div className="modal__footer">
            <button onClick={onClose}>Hủy</button>
            <button
              onClick={handleAddExisting}
              disabled={loading || selectedSongIds.size === 0}
            >
              {loading
                ? "Đang thêm..."
                : `Thêm vào nghệ sĩ${selectedSongIds.size > 0 ? ` (${selectedSongIds.size})` : ""}`}
            </button>
          </div>
        </div>

        <div className="modal__tabs">
          <button
            className={tab === "existing" ? "active" : ""}
            onClick={() => setTab("existing")}
          >
            Chọn từ danh sách
          </button>
          <button
            className={tab === "new" ? "active" : ""}
            onClick={() => setTab("new")}
          >
            Thêm bài mới
          </button>
        </div>

        {tab === "existing" && (
          <div className="modal__body">
            <input
              className="modal_search"
              placeholder="Tìm theo tên bài / nghệ sĩ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredSongs.length > 0 && (
              <div
                className="song-picker__select-all"
                onClick={() => {
                  const allIds = filteredSongs.map((s) => s._id);
                  const allSelected = allIds.every((id) =>
                    selectedSongIds.has(id),
                  );
                  setSelectedSongIds(
                    allSelected
                      ? new Set(
                          [...selectedSongIds].filter(
                            (id) => !allIds.includes(id),
                          ),
                        )
                      : new Set([...selectedSongIds, ...allIds]),
                  );
                }}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={filteredSongs.every((s) =>
                    selectedSongIds.has(s._id),
                  )}
                />
                <span>Chọn tất cả ({filteredSongs.length})</span>
              </div>
            )}

            <ul className="song-picker">
              {filteredSongs.map((song) => (
                <li
                  key={song._id}
                  className={selectedSongIds.has(song._id) ? "selected" : ""}
                  onClick={() => toggleSong(song._id)}
                >
                  <img
                    src={song.coverUrl || song.imageUrl || "/default-cover.png"}
                    alt={song.title}
                  />
                  <div>
                    <strong>{song.title}</strong>
                    <span>
                      {splitArtists(song.artist).map((a) => (
                        <span key={a}>{a}</span>
                      ))}
                    </span>
                  </div>
                  {selectedSongIds.has(song._id) && <span>✓</span>}
                </li>
              ))}
              {filteredSongs.length === 0 && <li>Không tìm thấy bài nào</li>}
            </ul>
          </div>
        )}

        {tab === "new" && (
          <form className="modal__body" onSubmit={handleCreateNew}>
            <p className="info-text">
              Bài hát mới sẽ được thêm vào hệ thống và liên kết với nghệ sĩ này.
            </p>
            <div className="form-group">
              <label>Tên bài hát *</label>
              <input
                value={newSong.title}
                onChange={(e) =>
                  setNewSong({ ...newSong, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Album</label>
              <input
                value={newSong.album}
                onChange={(e) =>
                  setNewSong({ ...newSong, album: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Thể loại</label>
              <input
                value={newSong.genre}
                onChange={(e) =>
                  setNewSong({ ...newSong, genre: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Link nhạc * (URL hoặc upload)</label>
              <select
                value={newSong.sourceType}
                onChange={(e) =>
                  setNewSong({ ...newSong, sourceType: e.target.value })
                }
              >
                <option value="url">URL</option>
                <option value="upload">Upload file</option>
              </select>
              <input
                value={newSong.audioUrl}
                onChange={(e) =>
                  setNewSong({ ...newSong, audioUrl: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>
            <div className="form-group">
              <label>Ảnh bìa (URL)</label>
              <input
                value={newSong.imageUrl}
                onChange={(e) =>
                  setNewSong({ ...newSong, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ArtistDetailPanel({ artistId, onChanged, onClose }) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("view");
  const [expandedAlbumId, setExpandedAlbumId] = useState(null);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState(null);
  const [albumContextMenu, setAlbumContextMenu] = useState(null);
  const [songContextMenu, setSongContextMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showEditAlbum, setShowEditAlbum] = useState(false);

  const fetchArtist = useCallback(async () => {
    if (!artistId) return;
    setLoading(true);
    try {
      const res = await artistService.getById(artistId);
      setArtist(res.data);
    } catch {
      showToast("Lỗi khi tải thông tin", "error");
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    setMode("view");
    setExpandedAlbumId(null);
    fetchArtist();
  }, [artistId, fetchArtist]);

  useEffect(() => {
    const close = () => {
      setAlbumContextMenu(null);
      setSongContextMenu(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleRemoveSong = (songId) => {
    setConfirm({
      message: "Gỡ bài hát?",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await artistService.removeSong(artistId, songId);
          fetchArtist();
          onChanged?.();
        } catch {
          showToast("Lỗi khi gỡ bài hát", "error");
        }
      },
    });
  };

  const handleDeleteAlbum = (albumId) => {
    setConfirm({
      message: "Xóa album này? Các bài hát sẽ không bị xóa",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await artistService.deleteAlbum(artistId, albumId);
          fetchArtist();
          onChanged?.();
        } catch {
          showToast("Lỗi khi xóa album", "error");
        }
      },
    });
  };

  const handleAlbumContextMenu = (e, albumId) => {
    e.preventDefault();
    e.stopPropagation();
    setSongContextMenu(null);
    setAlbumContextMenu({ x: e.clientX, y: e.clientY, albumId });
  };

  const handleSongContextMenu = (e, songId) => {
    e.preventDefault();
    e.stopPropagation();
    setAlbumContextMenu(null);
    setSongContextMenu({ x: e.clientX, y: e.clientY, songId });
  };

  if (!artistId) {
    return (
      <div className="artist-admin__detail-empty">
        <div className="artist-admin__detail-empty-icon">♪</div>
        <span>Chọn nghệ sĩ để xem chi tiết</span>
        <span style={{ fontSize: 11, marginTop: 2 }}>
          hoặc nhấn New Artist để thêm mới
        </span>
      </div>
    );
  }

  if (loading) {
    return <p className="artist-admin__loading">Đang tải...</p>;
  }

  if (!artist) return null;

  if (mode === "edit") {
    return (
      <div className="artist-admin__detail-form">
        <div className="artist-admin__detail-title">Sửa nghệ sĩ</div>
        <ArtistForm
          artist={artist}
          onSaved={() => {
            fetchArtist();
            setMode("view");
            onChanged?.();
          }}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  return (
    <div className="artist-admin__detail-form">
      <div className="artist-admin__detail-title artist-admin__detail-title--row">
        <span>Chi tiết nghệ sĩ</span>
        <div className="artist-admin__detail-title-actions">
          <button
            type="button"
            className="artist-admin__btn-edit"
            onClick={() => setMode("edit")}
          >
            Sửa
          </button>
          {onClose && (
            <button
              type="button"
              className="artist-admin__btn-close"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="artist-admin__info-row">
        <img
          src={artist.avatar || "/default-artist.png"}
          alt={artist.name}
          className="artist-admin__info-avatar"
        />
        <div className="artist-admin__info-text">
          <h3>{artist.name}</h3>
          <span className="artist-admin__info-country">
            {artist.country || "Không rõ quốc gia"}
          </span>
          {artist.description && (
            <p className="artist-admin__info-desc">{artist.description}</p>
          )}
        </div>
      </div>

      <div className="artist-admin__detail-section">
        <div className="artist-admin__detail-section-header">
          <span>Bài hát ({artist.songs?.length || 0})</span>
          <button
            type="button"
            className="artist-admin__btn-add-small"
            onClick={() => {
              setTargetAlbumId(null);
              setShowAddSong(true);
            }}
          >
            + Thêm
          </button>
        </div>
        <ul className="artist-admin__song-list">
          {(artist.songs || []).map((song) => (
            <li
              key={song._id}
              className="artist-admin__song-list-item"
              onContextMenu={(e) => handleSongContextMenu(e, song._id)}
            >
              {song.title}
            </li>
          ))}
          {(!artist.songs || artist.songs.length === 0) && (
            <li className="artist-admin__song-list-empty">Chưa có bài hát</li>
          )}
        </ul>
      </div>

      <div className="artist-admin__detail-section">
        <div className="artist-admin__detail-section-header">
          <span>Album ({artist.albums?.length || 0})</span>
          <button
            type="button"
            className="artist-admin__btn-add-small"
            onClick={() => setShowAddAlbum(true)}
          >
            + Thêm
          </button>
        </div>

        <div className="artist-admin__album-grid">
          {(artist.albums || []).map((album) => {
            const isOpen = expandedAlbumId === album._id;
            return (
              <div
                key={album._id}
                className={`artist-admin__album-card ${
                  isOpen ? "artist-admin__album-card--open" : ""
                }`}
              >
                <div
                  className="artist-admin__album-card-header"
                  onClick={() => setExpandedAlbumId(isOpen ? null : album._id)}
                  onContextMenu={(e) => handleAlbumContextMenu(e, album._id)}
                >
                  <img
                    src={album.coverImage || "/default-cover.png"}
                    alt={album.title}
                    className="artist-admin__album-cover"
                  />
                  <div className="artist-admin__album-info">
                    <strong>{album.title}</strong>
                    <span>
                      {album.releaseYear || "Chưa rõ năm"} ·{" "}
                      {album.songs?.length || 0} bài
                    </span>
                  </div>
                  <span className="artist-admin__album-arrow">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>

                {isOpen && (
                  <ul className="artist-admin__album-song-list">
                    {(album.songs || []).map((song) => (
                      <li
                        key={song._id}
                        onContextMenu={(e) =>
                          handleSongContextMenu(e, song._id)
                        }
                      >
                        {song.title}
                      </li>
                    ))}
                    {(!album.songs || album.songs.length === 0) && (
                      <li className="artist-admin__song-list-empty">
                        Chưa có bài hát
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
          {(!artist.albums || artist.albums.length === 0) && (
            <div className="artist-admin__song-list-empty">Chưa có album</div>
          )}
        </div>
      </div>

      {albumContextMenu && (
        <div
          className="context-menu"
          style={{ top: albumContextMenu.y, left: albumContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút thêm bài hát */}
          <button
            onClick={() => {
              setTargetAlbumId(albumContextMenu.albumId);
              setShowAddSong(true);
              setAlbumContextMenu(null);
            }}
          >
            + Add song
          </button>

          {/* Nút sửa album (thêm mới) */}
          <button
            onClick={() => {
              const album = artist.albums.find(
                (a) => a._id === albumContextMenu.albumId,
              );
              setEditingAlbum(album);
              setShowEditAlbum(true);
              setAlbumContextMenu(null);
            }}
          >
            Sửa album
          </button>

          {/* Nút xóa album */}
          <button
            className="btn--danger"
            onClick={() => {
              handleDeleteAlbum(albumContextMenu.albumId);
              setAlbumContextMenu(null);
            }}
          >
            - Delete album
          </button>
        </div>
      )}

      {songContextMenu && (
        <div
          className="context-menu"
          style={{ top: songContextMenu.y, left: songContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn--danger"
            onClick={() => {
              handleRemoveSong(songContextMenu.songId);
              setSongContextMenu(null);
            }}
          >
            Gỡ bài hát
          </button>
        </div>
      )}

      {showAddSong && (
        <AddSongModal
          artistId={artistId}
          albumId={targetAlbumId}
          onClose={() => {
            setShowAddSong(false);
            setTargetAlbumId(null);
          }}
          onSaved={() => {
            setShowAddSong(false);
            fetchArtist();
            onChanged?.();
          }}
        />
      )}

      {showAddAlbum && (
        <AddAlbumModal
          artistId={artistId}
          onClose={() => setShowAddAlbum(false)}
          onSaved={() => {
            setShowAddAlbum(false);
            fetchArtist();
            onChanged?.();
          }}
        />
      )}
      {showEditAlbum && editingAlbum && (
        <EditAlbumModal
          album={editingAlbum}
          artistId={artistId}
          onClose={() => {
            setShowEditAlbum(false);
            setEditingAlbum(null);
          }}
          onSaved={() => {
            setShowEditAlbum(false);
            setEditingAlbum(null);
            fetchArtist();
            onChanged?.();
          }}
        />
      )}

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default function Admin_Artist() {
  const { token } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeArtistId, setActiveArtistId] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const tableRef = useRef(null);

  const fetchArtists = useCallback(async () => {
    try {
      const res = await artistService.getAll();
      setArtists((prev) => {
        const incoming = res.data;
        if (prev.length === 0) return incoming;
        return incoming.map((newA) => {
          const old = prev.find((o) => o._id === newA._id);
          return old ? { ...newA, avatar: newA.avatar || old.avatar } : newA;
        });
      });
    } catch {
      showToast("Lỗi khi tải danh sách nghệ sĩ", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    document.title = "Artist Management";
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  function handleSaved() {
    const scrollTop = tableRef.current?.scrollTop ?? 0;
    fetchArtists(() => {
      requestAnimationFrame(() => {
        if (tableRef.current) tableRef.current.scrollTop = scrollTop;
      });
    });
  }

  const filteredArtists = artists.filter((artist) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      artist.name?.toLowerCase().includes(q) ||
      artist.country?.toLowerCase().includes(q)
    );
  });

  const PAGE_SIZE = 30;
  const totalPages = Math.ceil(filteredArtists.length / PAGE_SIZE);
  const pagedArtists = filteredArtists.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const visibleArtistIds = pagedArtists.map((a) => a._id);
  const allVisibleSelected =
    visibleArtistIds.length > 0 &&
    visibleArtistIds.every((id) => selectedIds.includes(id));

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleArtistIds.includes(id))
        : [...new Set([...prev, ...visibleArtistIds])],
    );
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  const handleDeleteSelected = () => {
    const count = selectedIds.length;
    setConfirm({
      message: `Xóa ${count} nghệ sĩ?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await Promise.all(selectedIds.map((id) => artistService.delete(id)));
          setArtists((prev) =>
            prev.filter((a) => !selectedIds.includes(a._id)),
          );
          if (selectedIds.includes(activeArtistId)) setActiveArtistId(null);
          setSelectedIds([]);
          showToast(`Đã xóa ${count} nghệ sĩ`, "success");
        } catch {
          showToast("Xóa thất bại", "error");
        }
      },
    });
  };

  const handleDelete = (id) => {
    setConfirm({
      message: "Xóa nghệ sĩ này? Các bài hát sẽ không bị xóa",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await artistService.delete(id);
          setArtists((prev) => prev.filter((a) => a._id !== id));
          if (activeArtistId === id) setActiveArtistId(null);
          showToast("Xoá thành công", "success");
        } catch {
          showToast("Xoá thất bại", "error");
        }
      },
    });
  };

  function handleNewArtist() {
    setActiveArtistId(null);
    setCreatingNew(true);
  }

  const headerActions = (
    <>
      {selectedIds.length > 0 && (
        <button
          type="button"
          className="artist-admin-btn artist-admin-btn--danger"
          onClick={handleDeleteSelected}
        >
          Delete ({selectedIds.length})
        </button>
      )}
      <button
        type="button"
        className="artist-admin-btn"
        onClick={handleNewArtist}
      >
        New Artist
      </button>
    </>
  );

  return (
    <AdminPage title="Quản lý nghệ sĩ" actions={headerActions}>
      <div className="artist-admin__layout">
        <div className="artist-admin__left">
          {/* <div className="artist-admin-meta">
            Artists <span>{artists.length}</span>
          </div> */}

          <div className="artist-admin__filter-bar">
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm kiếm tên / quốc gia..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIds([]);
                }}
                className="artist-admin__search-input"
              />
              {searchQuery && (
                <button
                  className="artist-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {creatingNew ? (
            <div className="artist-admin__detail-form">
              <div className="artist-admin__detail-title">Thêm nghệ sĩ</div>
              <ArtistForm
                artist={null}
                onSaved={() => {
                  setCreatingNew(false);
                  handleSaved();
                }}
                onCancel={() => setCreatingNew(false)}
              />
            </div>
          ) : (
            <ArtistDetailPanel
              artistId={activeArtistId}
              onChanged={handleSaved}
              onClose={() => setActiveArtistId(null)}
            />
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="artist-admin__right">
          {loading ? (
            <p className="artist-admin__loading">Đang tải...</p>
          ) : (
            <>
              <div className="artist-admin__table-shell">
                <div className="artist-admin__table-wrapper" ref={tableRef}>
                  <table className="artist-admin__table">
                    <colgroup>
                      <col className="artist-admin__col-select" />
                      <col className="artist-admin__col-name" />
                      <col className="artist-admin__col-stat" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="artist-admin__th">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="artist-admin__th">Tên</th>
                        <th className="artist-admin__th">Thống kê</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedArtists.length > 0 ? (
                        pagedArtists.map((artist) => (
                          <tr
                            key={artist._id}
                            className={[
                              "artist-admin__row",
                              selectedIds.includes(artist._id)
                                ? "artist-admin__row--selected"
                                : "",
                              activeArtistId === artist._id
                                ? "artist-admin__row--active"
                                : "",
                            ].join(" ")}
                            onClick={() => {
                              setCreatingNew(false);
                              setActiveArtistId(artist._id);
                            }}
                          >
                            <td
                              className="artist-admin__td"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(artist._id)}
                                onChange={() => toggleSelect(artist._id)}
                              />
                            </td>
                            <td className="artist-admin__td artist-admin__td--name">
                              {artist.name}
                            </td>
                            <td className="artist-admin__td">
                              <span className="artist-admin__badge">
                                {artist.songs?.length || 0} bài
                              </span>
                              <span className="artist-admin__badge">
                                {artist.albums?.length || 0} album
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="artist-admin__empty">
                            {searchQuery
                              ? `Không có Artists "${searchQuery}".`
                              : "Chưa có nghệ sĩ."}
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