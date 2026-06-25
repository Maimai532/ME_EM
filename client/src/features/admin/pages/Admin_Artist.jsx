import { useState, useEffect, useCallback, memo } from "react";
import { artistService } from "../../../shared/services/artist.service";
import { songService } from "../../home/services/songService";
import { useToast } from "../../../shared/hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Admin_Artist.css";

function ArtistForm({ artist, onSaved, onCancel }) {
  const isEdit = !!artist;
  const [form, setForm] = useState({
    name: artist?.name || "",
    country: artist?.country || "",
    description: artist?.description || "",
    avatarUrl: artist?.avatar || "",
  });
  const [avatarMode, setAvatarMode] = useState("url"); // "url" | "file"
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(artist?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [autoLinked, setAutoLinked] = useState(null);
  const { showToast } = useToast();

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
          Đã auto liên kết {autoLinked} bài hát có sẵn vào nghệ sĩ này!
        </div>
      )}

      <form onSubmit={handleSubmit} className="artist-form__body">
        <div className="form-group-avtar ">
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
  const [coverMode, setCoverMode] = useState("url"); // "url" | "file"
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>New Album</h3>
          <div className="modal__footer">
            <button type="button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo album"}
            </button>
          </div>
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
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
              value={form.releaseYear}
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
        </form>
      </div>
    </div>
  );
}

function AddSongModal({ artistId, albumId, onClose, onSaved }) {
  const [tab, setTab] = useState("existing"); // "existing" | "new"
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
                    src={song.imageUrl || "/default-cover.png"}
                    alt={song.title}
                  />
                  <div>
                    <strong>{song.title}</strong>
                    <span>
                      {song.artist
                        ?.split(/,| và /)
                        .map((a) => a.trim())
                        .filter(Boolean)
                        .map((a) => (
                          <span key={a} className="song-admin__artist-badge">
                            {a}
                          </span>
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

function ArtistDetail({ artistId, onBack, onEdit }) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState(null);
  const [expandedAlbumId, setExpandedAlbumId] = useState(null);
  const [albumContextMenu, setAlbumContextMenu] = useState(null);
  const [songContextMenu, setSongContextMenu] = useState(null);
  const { showToast } = useToast();
  const [confirm, setConfirm] = useState(null);

  const fetchArtist = async () => {
    try {
      const res = await artistService.getById(artistId);
      setArtist(res.data);
    } catch {
      showToast("Lỗi khi tải thông tin", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtist();
  }, [artistId]);

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

  if (loading) return <p>Đang tải...</p>;
  if (!artist) return <p>Không tìm thấy nghệ sĩ.</p>;

  return (
    <div className="artist-detail">
      <div className="artist-detail__header">
        <button onClick={onBack}>← Back</button>
        <button onClick={onEdit}>Edit</button>
      </div>

      <div className="artist-detail_info">
        <div className="artist-detail__name">
          <img src={artist.avatar || "/default-artist.png"} alt={artist.name} />
          <div>
            <h2>{artist.name}</h2>
            <p>{artist.country}</p>
            <p>{artist.description}</p>
          </div>
        </div>

        <div className="artist-detail__song">
          <div className="artist-detail__song-header">
            <h3>Song ({artist.songs.length})</h3>
            <button
              onClick={() => {
                setTargetAlbumId(null);
                setShowAddSong(true);
              }}
            >
              Thêm bài
            </button>
          </div>
          <ul className="song-list">
            {artist.songs.map((song) => (
              <li
                key={song._id}
                className="song-item"
                onContextMenu={(e) => handleSongContextMenu(e, song._id)}
              >
                <img src={song.imageUrl} alt={song.title} />
                <span>{song.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="artist-detail__section">
        <div className="album-header">
          <h3>Albums ({artist.albums.length})</h3>
          <button onClick={() => setShowAddAlbum(true)}>Thêm album</button>
        </div>

        {artist.albums.map((album) => (
          <div key={album._id} className="album-card">
            <div
              className="album-card__header"
              onClick={() =>
                setExpandedAlbumId(
                  expandedAlbumId === album._id ? null : album._id,
                )
              }
              onContextMenu={(e) => handleAlbumContextMenu(e, album._id)}
              style={{ cursor: "pointer" }}
            >
              {album.coverImage && (
                <img src={album.coverImage} alt={album.title} />
              )}
              <div>
                <h4>{album.title}</h4>
                <span>{album.releaseYear || "Chưa rõ năm"}</span>
                <span> · {album.songs.length} bài</span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 12 }}>
                {expandedAlbumId === album._id ? "▲" : "▼"}
              </span>
            </div>

            {expandedAlbumId === album._id && (
              <ul className="album-list">
                {album.songs.map((song) => (
                  <li
                    key={song._id}
                    className="album-item"
                    onContextMenu={(e) => handleSongContextMenu(e, song._id)}
                    style={{ cursor: "context-menu" }}
                  >
                    <img src={song.imageUrl} alt={song.title} />
                    <span>{song.title}</span>
                  </li>
                ))}
                {album.songs.length === 0 && <li>Chưa có bài hát</li>}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Context menu — Album */}
      {albumContextMenu && (
        <div
          className="context-menu"
          style={{ top: albumContextMenu.y, left: albumContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setTargetAlbumId(albumContextMenu.albumId);
              setShowAddSong(true);
              setAlbumContextMenu(null);
            }}
          >
            + Add song
          </button>
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

      {/* Context menu — Song */}
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

const ArtistCard = memo(function ArtistCard({
  artist,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="artist-item" onClick={onView} style={{ cursor: "pointer" }}>
      <img
        src={artist.avatar || "/default-artist.png"}
        alt={artist.name}
        className="artist-item__avatar"
        loading="lazy"
      />
      <div className="artist-item__info">
        <h3>{artist.name}</h3>
        <span>{artist.country || "Không rõ"}</span>
        <span>
          {artist.songs?.length || 0} bài · {artist.albums?.length || 0} album
        </span>
      </div>
      <div
        className="artist-item__actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onEdit}>Sửa</button>
        <button className="btn--danger" onClick={onDelete}>
          Xóa
        </button>
      </div>
    </div>
  );
});

export default function ArtistManagement() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState([]);

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
    fetchArtists();
  }, [fetchArtists]);

  const filteredArtists = artists.filter((artist) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      artist.name?.toLowerCase().includes(q) ||
      artist.country?.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id) => {
    setConfirm({
      message: "Xóa nghệ sĩ này? Các bài hát sẽ không bị xóa",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await artistService.delete(id);
          setArtists((prev) => prev.filter((a) => a._id !== id));
          showToast("Xoá thành công", "success");
        } catch {
          showToast("Xoá thất bại", "error");
        }
      },
    });
  };

  const handleSaved = () => {
    setShowForm(false);
    setSelected(null);
    fetchArtists();
  };

  const openCreate = () => {
    setSelected(null);
    setShowForm(true);
  };
  const openEdit = (artist) => {
    setSelected(artist);
    setShowForm(true);
  };
  function toggleSelect(id) {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  );
}
const allSelected =
  filteredArtists.length > 0 &&
  filteredArtists.every((a) => selectedIds.includes(a._id));

  if (view === "detail") {
    return (
      <>
        <ArtistDetail
          artistId={selected._id}
          onBack={() => {
            setView("list");
            setSelected(null);
          }}
          onEdit={() => openEdit(selected)}
        />

        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowForm(false);
            }}
          >
            <div
              className="modal modal--large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h3>Sửa nghệ sĩ</h3>
                <button onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="modal__body">
                <ArtistForm
                  artist={selected}
                  onSaved={() => {
                    setShowForm(false);
                    fetchArtists();
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="artist-management">
      <div className="artist-management__header">
        <h2>Quản lý nghệ sĩ</h2>
        <button className="artist-management-btn" onClick={openCreate}>
          New Artist
        </button>
      </div>

      <div className="artist-management__search">
        <input
          type="text"
          placeholder="Tìm kiếm tên/quốc gia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="artist-search-input"
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

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="artist-list">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist._id}
              artist={artist}
              onView={() => {
                setSelected(artist);
                setView("detail");
              }}
              onEdit={() => openEdit(artist)}
              onDelete={() => handleDelete(artist._id)}
            />
          ))}
          {filteredArtists.length === 0 && (
            <p>
              {searchQuery
                ? `Không có Artists "${searchQuery}".`
                : "Chưa có nghệ sĩ."}
            </p>
          )}
        </div>
      )}

      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            setSelected(null);
          }}
        >
          <div
            className="modal modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3>{selected ? "Sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}</h3>
              
            </div>
            <div className="modal__body">
              <ArtistForm
                artist={selected}
                onSaved={handleSaved}
                onCancel={() => {
                  setShowForm(false);
                  setSelected(null);
                }}
              />
            </div>
          </div>
        </div>
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
