import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylist } from "../context/PlaylistContext";
import "../styles/Library.css";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePlayer } from "../../player/context/PlayerContext";
import { Plus, Trash2, ListMusic } from "lucide-react";
import ConfirmModal from "../../../shared/components/ConfirmModal";

export default function Library() {
  const { playlists, fetchPlaylists, createPlaylist, deletePlaylist } =
    usePlaylist();
  const navigate = useNavigate();
  const { likedSongs, fetchLikedSongs } = useAuth();
  const { playSong } = usePlayer();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useEffect(() => {
    fetchPlaylists();
    fetchLikedSongs();
  }, []);

  async function handleCreate() {
    const name = prompt("Tên playlist:");
    if (name?.trim()) await createPlaylist(name.trim());
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
      <div className="library__header" style={{ marginBottom: 12 }}>
        <h2 className="library__title" style={{ fontSize: 18 }}>
          Playlist của bạn
        </h2>
        <button className="library__new-btn" onClick={handleCreate}>
          <Plus size={16} /> Playlist mới
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
              {pl.songs?.[0]?.imageUrl ? (
                <div className="library__stack">
                  <img
                    className="library__stack-img"
                    src={pl.songs[0].imageUrl}
                    alt={pl.name}
                  />
                </div>
              ) : (
                <ListMusic size={32} opacity={0.4} />
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
        // title="Đăng xuất ?"
        message="Bạn có chắc muốn xoá playlist này không ?"
        cancel="Huỷ"
        confirm="Xoá"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedPlaylistId(null);
        }}
      />
    </div>
  );
}
