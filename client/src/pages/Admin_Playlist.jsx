import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const styles = {
  container: { padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { fontSize: "22px", fontWeight: "600", color: "#1e3a5f" },
  btnAdd: { padding: "8px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", backgroundColor: "#f8fafc" },
  cardTitle: { fontSize: "16px", fontWeight: "600", color: "#1e3a5f", marginBottom: "4px" },
  badge: { display: "inline-block", fontSize: "12px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "#dbeafe", color: "#1d4ed8", marginBottom: "8px" },
  cardDesc: { fontSize: "13px", color: "#6b7280", marginBottom: "12px" },
  songCount: { fontSize: "13px", color: "#374151", marginBottom: "12px" },
  cardFooter: { display: "flex", gap: "8px" },
  btnEdit: { flex: 1, padding: "6px", border: "1px solid #2563eb", borderRadius: "6px", color: "#2563eb", backgroundColor: "white", cursor: "pointer" },
  btnDel: { flex: 1, padding: "6px", border: "1px solid #dc2626", borderRadius: "6px", color: "#dc2626", backgroundColor: "white", cursor: "pointer" },
  btnManage: { flex: 1, padding: "6px", border: "1px solid #16a34a", borderRadius: "6px", color: "#16a34a", backgroundColor: "white", cursor: "pointer" },
  // Modal
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "440px" },
  modalTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1e3a5f" },
  label: { display: "block", fontSize: "13px", color: "#555", marginBottom: "4px", marginTop: "12px" },
  input: { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  select: { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" },
  btnCancel: { padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "white", cursor: "pointer" },
  btnSave: { padding: "8px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  // Manage songs modal
  songItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" },
  btnRemove: { padding: "3px 8px", border: "1px solid #dc2626", borderRadius: "4px", color: "#dc2626", backgroundColor: "white", cursor: "pointer", fontSize: "12px" },
  btnAddSong: { padding: "3px 8px", border: "1px solid #16a34a", borderRadius: "4px", color: "#16a34a", backgroundColor: "white", cursor: "pointer", fontSize: "12px" },
};

const emptyForm = { name: "", description: "", layout: "scroll", order: 0 };

// Modal tạo / sửa section
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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>{isEdit ? "Sửa section" : "Tạo section mới"}</h2>

        <label style={styles.label}>Tên section *</label>
        <input style={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="VD: Xu hướng, Nổi bật..." />

        <label style={styles.label}>Mô tả</label>
        <input style={styles.input} name="description" value={form.description} onChange={handleChange} />

        <label style={styles.label}>Kiểu hiển thị</label>
        <select style={styles.select} name="layout" value={form.layout} onChange={handleChange}>
          <option value="scroll">Scroll — cuộn ngang</option>
          <option value="grid">Grid — lưới nhiều cột</option>
          <option value="list">List — danh sách dọc</option>
        </select>

        <label style={styles.label}>Thứ tự hiển thị</label>
        <input style={styles.input} name="order" type="number" value={form.order} onChange={handleChange} />

        <div style={styles.modalFooter}>
          <button style={styles.btnCancel} onClick={onClose}>Huỷ</button>
          <button style={styles.btnSave} onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal quản lý bài hát trong section
function ManageSongsModal({ section, onClose, token }) {
  const [allSongs, setAllSongs] = useState([]);
  const [sectionSongs, setSectionSongs] = useState(section.songs || []);

  useEffect(() => {
    axios.get(`${API_URL}/songs`).then((res) => setAllSongs(res.data.data));
  }, []);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  async function handleAdd(songId) {
    await axios.post(`${API_URL}/sections/${section._id}/songs`, { songId }, config);
    setSectionSongs((prev) => [...prev, allSongs.find((s) => s._id === songId)]);
  }

  async function handleRemove(songId) {
    await axios.delete(`${API_URL}/sections/${section._id}/songs`, { ...config, data: { songId } });
    setSectionSongs((prev) => prev.filter((s) => s._id !== songId));
  }

  const sectionSongIds = sectionSongs.map((s) => s._id);
  const songsNotInSection = allSongs.filter((s) => !sectionSongIds.includes(s._id));

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, width: "520px", maxHeight: "80vh", overflowY: "auto" }}>
        <h2 style={styles.modalTitle}>Bài hát trong "{section.name}"</h2>

        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>Đang có ({sectionSongs.length} bài)</p>
        {sectionSongs.map((song) => (
          <div key={song._id} style={styles.songItem}>
            <span style={{ fontSize: "14px" }}>{song.title} — {song.artist}</span>
            <button style={styles.btnRemove} onClick={() => handleRemove(song._id)}>Xoá</button>
          </div>
        ))}

        <p style={{ fontSize: "13px", color: "#6b7280", margin: "16px 0 8px" }}>Thêm bài hát ({songsNotInSection.length} bài chưa có)</p>
        {songsNotInSection.map((song) => (
          <div key={song._id} style={styles.songItem}>
            <span style={{ fontSize: "14px" }}>{song.title} — {song.artist}</span>
            <button style={styles.btnAddSong} onClick={() => handleAdd(song._id)}>+ Thêm</button>
          </div>
        ))}

        <div style={styles.modalFooter}>
          <button style={styles.btnSave} onClick={onClose}>Xong</button>
        </div>
      </div>
    </div>
  );
}

function Playlist_Admin() {
  const { token } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);       // null | section object
  const [manageModal, setManageModal] = useState(null); // null | section object

  function fetchSections() {
    setLoading(true);
    axios.get(`${API_URL}/sections`)
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý Section</h1>
        <button style={styles.btnAdd} onClick={() => setModal(emptyForm)}>+ Tạo section</button>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div style={styles.grid}>
          {sections.map((sec) => (
            <div key={sec._id} style={styles.card}>
              <h2 style={styles.cardTitle}>{sec.name}</h2>
              <span style={styles.badge}>{layoutLabel[sec.layout]}</span>
              <p style={styles.cardDesc}>{sec.description || "Chưa có mô tả"}</p>
              <p style={styles.songCount}>🎵 {sec.songs?.length || 0} bài hát</p>
              <div style={styles.cardFooter}>
                <button style={styles.btnManage} onClick={() => setManageModal(sec)}>Bài hát</button>
                <button style={styles.btnEdit} onClick={() => setModal(sec)}>Sửa</button>
                <button style={styles.btnDel} onClick={() => handleDelete(sec._id)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <SectionModal section={modal} token={token} onClose={() => setModal(null)} onSaved={fetchSections} />
      )}
      {manageModal && (
        <ManageSongsModal section={manageModal} token={token} onClose={() => { setManageModal(null); fetchSections(); }} />
      )}
    </div>
  );
}

export default Playlist_Admin;