import { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import axios from "axios";

import AdminPage from "./Admin_Page";
import { useToast } from "../../../shared/hooks/useToast";
import ConfirmModal from "../components/ConfirmModal";
import ManageItemsModal from "../components/ManageItemsModal";
import "../styles/Admin_Section.css";
import { API_URL } from "../../../shared/constants/api";

const emptyForm = {
  name: "",
  description: "",
  layout: "scroll",
  order: 0,
  type: "song",
};

function extractSections(res) {
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}

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
    <div className="section-admin-overlay">
      <div className="section-admin-modal">
        <h2 className="section-admin-modal__title">
          {isEdit ? "Sửa section" : "Tạo section mới"}
        </h2>

        <label className="section-admin__label">Tên section *</label>
        <input
          className="section-admin__input"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="VD: Xu hướng, Nghệ sĩ nổi bật..."
        />

        <label className="section-admin__label">Mô tả</label>
        <input
          className="section-admin__input"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label className="section-admin__label">Loại section *</label>
        <select
          className="section-admin__select"
          name="type"
          value={form.type}
          onChange={handleChange}
          disabled={isEdit}
        >
          <option value="song">Song</option>
          <option value="artist">Artist</option>
        </select>

        <label className="section-admin__label">Kiểu hiển thị</label>
        <select
          className="section-admin__select"
          name="layout"
          value={form.layout}
          onChange={handleChange}
        >
          <option value="scroll">Scroll — cuộn ngang</option>
          <option value="grid">Grid — lưới nhiều cột</option>
          <option value="list">List — danh sách dọc</option>
        </select>

        <label className="section-admin__label">Thứ tự hiển thị</label>
        <input
          className="section-admin__input"
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
        />

        <div className="section-admin-modal__footer">
          <button
            type="button"
            className="section-admin__btn-cancel"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="section-admin__btn-save"
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

function Admin_Section() {
  const { token } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [manageModal, setManageModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Sections Management";
  }, []);
  function fetchSections() {
    setLoading(true);
    axios
      .get(`${API_URL}/sections`)
      .then((res) => setSections(extractSections(res)))
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSections();
  }, []);

  function handleDelete(id) {
    setConfirm({
      message: "Xoá section này?",
      onConfirm: async () => {
        setConfirm(null);
        try {
          await axios.delete(`${API_URL}/sections/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchSections();
          showToast("Đã xoá section", "success");
        } catch {
          showToast("Xoá thất bại", "error");
        }
      },
    });
  }

  const layoutLabel = { scroll: "Scroll", grid: "Grid", list: "List" };
  const typeLabel = { song: "Song", artist: "Artist" };

  const headerActions = (
    <button
      type="button"
      className="section-admin__btn-add"
      onClick={() => setModal({ ...emptyForm })}
    >
      + New section
    </button>
  );

  return (
    <AdminPage title="Quản lý Section" actions={headerActions}>
      <div className="section-admin-meta">
        Sections: <span>{sections.length}</span>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : sections.length === 0 ? (
        <p className="section-admin__empty">
          Chưa có section nào. Tạo mới thôi!
        </p>
      ) : (
        <div className="section-admin__grid">
          {sections.map((sec) => {
            const isArtist = sec.type === "artist";
            const itemCount = isArtist
              ? Array.isArray(sec.artists)
                ? sec.artists.length
                : 0
              : Array.isArray(sec.songs)
                ? sec.songs.length
                : 0;

            return (
              <div key={sec._id} className="section-admin__card">
                <div className="section-admin__card-top">
                  <h2 className="section-admin__card-title">{sec.name}</h2>
                  <span className="section-admin__badge">
                    {layoutLabel[sec.layout]}
                  </span>
                  <span
                    className={`section-admin__type-badge section-admin__type-badge--${sec.type || "song"}`}
                  >
                    {typeLabel[sec.type] || "Song"}
                  </span>
                </div>
                <p className="section-admin__card-desc">
                  {sec.description || "Chưa có mô tả"}
                </p>
                <p className="section-admin__item-count">
                  {isArtist
                    ? `🎤 ${itemCount} nghệ sĩ`
                    : `🎵 ${itemCount} bài hát`}
                </p>
                <div className="section-admin__card-footer">
                  <button
                    type="button"
                    className="section-admin__btn-manage"
                    onClick={() => setManageModal(sec)}
                  >
                    {isArtist ? "Nghệ sĩ" : "Bài hát"}
                  </button>
                  <button
                    type="button"
                    className="section-admin__btn-edit"
                    onClick={() => setModal(sec)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="section-admin__btn-del"
                    onClick={() => handleDelete(sec._id)}
                  >
                    Xoá
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <SectionModal
          section={modal}
          token={token}
          onClose={() => setModal(null)}
          onSaved={fetchSections}
        />
      )}
      {manageModal && (
        <ManageItemsModal
          section={manageModal}
          token={token}
          onClose={() => {
            setManageModal(null);
            fetchSections();
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
    </AdminPage>
  );
}

export default Admin_Section;
