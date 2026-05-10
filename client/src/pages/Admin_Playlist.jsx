import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AdminPage from "./Admin_Page";
import "../styles/Admin_Playlist.css";

const API_URL = "http://localhost:8080/api";

const emptyForm = { name: "", description: "", layout: "scroll", order: 0 };

function SectionModal({ section, onClose, onSaved, token }) {
  const isEdit = !!section._id;
  const [form, setForm] = useState(section);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      isEdit
        ? await axios.put(`${API_URL}/sections/${section._id}`, form, config)
        : await axios.post(`${API_URL}/sections`, form, config);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="playlist-admin-overlay">
      <div className="playlist-admin-modal">
        <h2 className="playlist-admin-modal__title">
          {isEdit ? "Sửa section" : "Tạo section mới"}
        </h2>

        <label className="playlist-admin__label">Tên section *</label>
        <input
          className="playlist-admin__input"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="VD: Xu hướng, Nổi bật..."
        />

        <label className="playlist-admin__label">Mô tả</label>
        <input
          className="playlist-admin__input"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label className="playlist-admin__label">Kiểu hiển thị</label>
        <select
          className="playlist-admin__select"
          name="layout"
          value={form.layout}
          onChange={handleChange}
        >
          <option value="scroll">Scroll — cuộn ngang</option>
          <option value="grid">Grid — lưới nhiều cột</option>
          <option value="list">List — danh sách dọc</option>
        </select>

        <label className="playlist-admin__label">Thứ tự hiển thị</label>
        <input
          className="playlist-admin__input"
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
        />

        <div className="playlist-admin-modal__footer">
          <button type="button" className="playlist-admin__btn-cancel" onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            className="playlist-admin__btn-save"
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

function ManageSongsModal({ section, onClose, token }) {
  const [allSongs, setAllSongs] = useState([]);
  const [sectionSongs, setSectionSongs] = useState(section.songs || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    axios.get(`${API_URL}/songs`).then((res) => setAllSongs(res.data.data));
  }, []);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  async function handleAdd(songId) {
    await axios.post(`${API_URL}/sections/${section._id}/songs`, { songId }, config);
    setSectionSongs((prev) => [...prev, allSongs.find((s) => s._id === songId)]);
  }

  async function handleRemove(songId) {
    await axios.delete(`${API_URL}/sections/${section._id}/songs`, {
      ...config,
      data: { songId },
    });
    setSectionSongs((prev) => prev.filter((s) => s._id !== songId));
  }

  const sectionSongIds = sectionSongs.map((s) => s._id);
  const songsNotInSection = allSongs.filter((s) => !sectionSongIds.includes(s._id));

  const genreOptions = ["all", ...Array.from(
    new Set(songsNotInSection.map((s) => s.genre).filter(Boolean))
  ).sort()];

  const filteredSongs = songsNotInSection.filter((song) => {
    const matchGenre = selectedGenre === "all" || song.genre === selectedGenre;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || song.title?.toLowerCase().includes(q) || song.artist?.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  return (
    <div className="playlist-admin-overlay">
      <div className="playlist-admin-modal playlist-admin-modal--wide">

        <div className="playlist-admin__head">
          <h2 className="playlist-admin-modal__title">
            Playlist: <strong>{section.name}</strong>
          </h2>
          <button type="button" className="playlist-admin__btn-save" onClick={onClose}>
            Xong
          </button>
        </div>

        {/* Bảng bài hát ĐANG CÓ */}
        <div className="playlist-table-block">
          <p className="playlist-table-label playlist-table-label--in">
            Đã có
            <span className="playlist-table-count">{sectionSongs.length}</span>
          </p>
          <table className="playlist-table">
            <thead>
              <tr>
                <th className="playlist-table__th">#</th>
                <th className="playlist-table__th">Name</th>
                <th className="playlist-table__th">Artist</th>
                <th className="playlist-table__th">Genre</th>
                <th className="playlist-table__th"></th>
              </tr>
            </thead>
            <tbody>
              {sectionSongs.length === 0 ? (
                <tr><td colSpan="5" className="playlist-table__empty">Trống</td></tr>
              ) : (
                sectionSongs.map((song, i) => (
                  <tr key={song._id} className="playlist-table__row playlist-table__row--in">
                    <td className="playlist-table__td playlist-table__td--num">{i + 1}</td>
                    <td className="playlist-table__td playlist-table__td--title">{song.title}</td>
                    <td className="playlist-table__td">{song.artist}</td>
                    <td className="playlist-table__td">
                      <span className="playlist-table__genre">{song.genre || "—"}</span>
                    </td>
                    <td className="playlist-table__td playlist-table__td--action">
                      <button type="button" className="playlist-table__btn playlist-table__btn--remove" onClick={() => handleRemove(song._id)}>−</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bảng bài hát CÓ THỂ THÊM */}
        <div className="playlist-table-block">
          <p className="playlist-table-label playlist-table-label--add">
            Chưa có
            <span className="playlist-table-count">{songsNotInSection.length}</span>
          </p>

          {/* Filter bar */}
          <div className="playlist-filter-bar">
            <div className="playlist-filter-bar__search-wrap">
              <span className="playlist-filter-bar__icon">🔍</span>
              <input
                className="playlist-filter-bar__search"
                type="text"
                placeholder="Tìm tên bài / artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="playlist-filter-bar__clear" onClick={() => setSearchQuery("")}>×</button>
              )}
            </div>

            <select
              className="playlist-filter-bar__genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genreOptions.map((g) => (
                <option key={g} value={g}>{g === "all" ? "Tất cả thể loại" : g}</option>
              ))}
            </select>

            {(searchQuery || selectedGenre !== "all") && (
              <button type="button" className="playlist-filter-bar__reset" onClick={() => { setSearchQuery(""); setSelectedGenre("all"); }}>
                Xoá lọc
              </button>
            )}

            <span className="playlist-filter-bar__count">{filteredSongs.length}/{songsNotInSection.length} bài</span>
          </div>

          <table className="playlist-table">
            <thead>
              <tr>
                <th className="playlist-table__th">#</th>
                <th className="playlist-table__th">Tên bài</th>
                <th className="playlist-table__th">Artist</th>
                <th className="playlist-table__th">Genre</th>
                <th className="playlist-table__th"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="playlist-table__empty">
                    {songsNotInSection.length === 0 ? "Trống" : "Không tìm thấy bài hát phù hợp"}
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song, i) => (
                  <tr key={song._id} className="playlist-table__row playlist-table__row--add">
                    <td className="playlist-table__td playlist-table__td--num">{i + 1}</td>
                    <td className="playlist-table__td playlist-table__td--title">{song.title}</td>
                    <td className="playlist-table__td">{song.artist}</td>
                    <td className="playlist-table__td">
                      <span className="playlist-table__genre">{song.genre || "—"}</span>
                    </td>
                    <td className="playlist-table__td playlist-table__td--action">
                      <button type="button" className="playlist-table__btn playlist-table__btn--add" onClick={() => handleAdd(song._id)}>+</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

function Admin_Playlist() {
  const { token } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [manageModal, setManageModal] = useState(null);

  function fetchSections() {
    setLoading(true);
    axios
      .get(`${API_URL}/sections`)
      .then((res) => setSections(res.data.data))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSections(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Xoá section này?")) return;
    try {
      await axios.delete(`${API_URL}/sections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSections();
    } catch {
      alert("Xoá thất bại");
    }
  }

  const layoutLabel = { scroll: "Scroll", grid: "Grid", list: "List" };

  const headerActions = (
    <button type="button" className="playlist-admin__btn-add" onClick={() => setModal(emptyForm)}>
      + New playlist
    </button>
  );

  return (
    <AdminPage title="Quản lý Playlist" actions={headerActions}>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="playlist-admin__grid">
          {sections.map((sec) => (
            <div key={sec._id} className="playlist-admin__card">
              <h2 className="playlist-admin__card-title">{sec.name}</h2>
              <span className="playlist-admin__badge">{layoutLabel[sec.layout]}</span>
              <p className="playlist-admin__card-desc">{sec.description || "Chưa có mô tả"}</p>
              <p className="playlist-admin__song-count">🎵 {sec.songs?.length || 0} bài hát</p>
              <div className="playlist-admin__card-footer">
                <button type="button" className="playlist-admin__btn-manage" onClick={() => setManageModal(sec)}>Bài hát</button>
                <button type="button" className="playlist-admin__btn-edit" onClick={() => setModal(sec)}>Sửa</button>
                <button type="button" className="playlist-admin__btn-del" onClick={() => handleDelete(sec._id)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <SectionModal section={modal} token={token} onClose={() => setModal(null)} onSaved={fetchSections} />
      )}
      {manageModal && (
        <ManageSongsModal
          section={manageModal}
          token={token}
          onClose={() => { setManageModal(null); fetchSections(); }}
        />
      )}
    </AdminPage>
  );
}

export default Admin_Playlist;