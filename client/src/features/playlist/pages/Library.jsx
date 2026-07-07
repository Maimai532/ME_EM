import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylist } from "../context/PlaylistContext";
import "../styles/Library.css";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePlayer } from "../../player/context/PlayerContext";
import { Plus, Trash2, ListMusic, X } from "lucide-react";
import { createPortal } from "react-dom";
import ConfirmModal from "../../../shared/components/ConfirmModal";

export default function Library() {
  const { playlists, fetchPlaylists, createPlaylist, deletePlaylist } =
    usePlaylist();
  const navigate = useNavigate();
  const { likedSongs, fetchLikedSongs } = useAuth();
  const { playSong } = usePlayer();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Create playlist modal state ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchPlaylists();
    fetchLikedSongs();
  }, []);

  function closeCreateModal() {
    setShowCreateModal(false);
    setNewName("");
    setNewDescription("");
    setCreateError("");
  }

  async function handleCreatePlaylist() {
    if (!newName.trim()) {
      setCreateError("Vui lòng nhập tên playlist");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createPlaylist(
        newName.trim(),
        newDescription.trim(),
      );
      closeCreateModal();
      navigate(`/playlist/${created._id}`);
    } catch (err) {
      setCreateError("Tạo playlist thất bại, thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedPlaylistId) {
      await deletePlaylist(selectedPlaylistId);
      setSelectedPlaylistId(null);
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="library">
      <div className="library__header">
        <h2 className="library__title">Playlist của bạn</h2>
        <button
          className="playlist__creat"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Tạo playlist
        </button>
      </div>

      <div className="library__grid" style={{ marginBottom: 40 }}>
        <div
          key="liked"
          className="library__card library__card--liked"
          onClick={() => navigate("/liked-songs")}
        >
          <div
            className="library__card-cover"
            style={{
              background: "linear-gradient(135deg, #ff5c8a33, #ff5c8a11)",
            }}
          ></div>
          <div className="library__card-info">
            <p className="library__card-name">Bài hát yêu thích</p>
            <p className="library__card-count">{likedSongs.length} bài</p>
          </div>
        </div>

        {playlists.map((pl) => (
          <div
            key={pl._id}
            className="library__card"
            onClick={() => navigate(`/playlist/${pl._id}`)}
          >
            <div className="library__card-cover">
              {pl.songs?.[0]?.coverUrl || pl.songs?.[0]?.imageUrl ? (
                <div className="library__stack">
                  <img
                    className="library__stack-img"
                    src={pl.songs[0].coverUrl || pl.songs[0].imageUrl}
                    alt={pl.name}
                  />
                </div>
              ) : (
                <div className="library__stack">
                  <ListMusic size={32} className="library__stack-empty" />
                </div>
              )}
            </div>

            <div className="library__card-info">
              <p className="library__card-name">{pl.name}</p>
              <p className="library__card-count">{pl.songs?.length ?? 0} bài</p>
            </div>
            <button
              className="library__card-delete"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlaylistId(pl._id);
                setShowDeleteModal(true);
              }}
              title="Xoá playlist"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        message="Bạn có chắc muốn xoá playlist này không ?"
        cancel="Huỷ"
        confirm="Xoá"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedPlaylistId(null);
        }}
      />

      {/* MODAL */}
      {showCreateModal &&
        createPortal(
          <div className="cpl-overlay" onClick={closeCreateModal}>
            <div className="cpl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cpl-header">
                <span className="cpl-title">Tạo playlist mới</span>
                <button className="cpl-close" onClick={closeCreateModal}>
                  <X size={18} />
                </button>
              </div>

              <div className="cpl-body">
                <label className="cpl-label">Tên playlist</label>
                <input
                  autoFocus
                  className="cpl-input"
                  placeholder="Ví dụ: Nhạc chill cuối tuần"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (createError) setCreateError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                />

                {/* <label className="cpl-label">Mô tả (tuỳ chọn)</label>
                <textarea
                  className="cpl-textarea"
                  placeholder="Mô tả ngắn về playlist..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                /> */}

                {createError && <p className="cpl-error">{createError}</p>}
              </div>

              <div className="cpl-footer">
                <button
                  className="cpl-btn cpl-btn--cancel"
                  onClick={closeCreateModal}
                >
                  Huỷ
                </button>
                <button
                  className="cpl-btn cpl-btn--confirm"
                  onClick={handleCreatePlaylist}
                  disabled={submitting}
                >
                  {submitting ? "Đang tạo..." : "Tạo playlist"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
