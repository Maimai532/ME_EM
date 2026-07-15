import "../styles/Playlist.css";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Trash2, ArrowLeft, Music, X } from "lucide-react";
import { createPortal } from "react-dom";
import { usePlayer } from "../../player/context/PlayerContext";
import { usePlaylist } from "../context/PlaylistContext";
import * as playlistService from "../services/playlistService";

export default function Playlist() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const { removeSong, createPlaylist } = usePlaylist();
  const [playlist, setPlaylist] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Create playlist modal state ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await playlistService.getPlaylistById(id);
        const data = res.data?.data ?? res.data;
        setPlaylist(data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);
   useEffect(() => {
    if (playlist) document.title = playlist.name;
  }, [playlist]);

  if (loading) return <p style={{ padding: 32, color: "#fff" }}>Đang tải...</p>;
  if (!playlist)
    return (
      <p style={{ padding: 32, color: "#fff" }}>Không tìm thấy playlist</p>
    );

  const songs = playlist.songs ?? [];
console.log("showCreateModal:", showCreateModal);
  return (
    <div className="playlist-page">
      <button className="playlist__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="playlist__hero">
        <div className="playlist__hero-info">

          <div className="playlist__text">
            <h1 className="playlist__name">{playlist.name}</h1>
            {playlist.description && (
              <p className="playlist__meta">{playlist.description}</p>
            )}
            <p className="playlist__meta" style={{ marginTop: 6 }}>
              {songs.length} bài hát
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
           
                <button
                  className="playlist__play-all"
                  onClick={() => playSong(songs[0], songs)}
                >
                  <Play size={16} fill="currentColor" />
                  Phát tất cả
                </button>
            </div>
          </div>
        </div>

        <div className="playlist__hero-songs">
          {songs.length === 0 ? (
            <p className="playlist__empty">Playlist chưa có bài nào.</p>
          ) : (
            <div className="song-list">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="song-row"
                  onClick={() => playSong(song, songs)}
                >
                  <div className="song-row__index-wrap">
                    <span className="song-row__index">{index + 1}</span>
                    <span className="song-row__play">
                      <Play size={12} fill="currentColor" />
                    </span>
                  </div>

                  {song.coverUrl || song.imageUrl ? (
                    <img
                      src={song.coverUrl || song.imageUrl}
                      alt={song.title}
                      className="song-row__thumb"
                    />
                  ) : (
                    <div className="song-row__thumb song-row__thumb--placeholder">
                      <Music size={20} />
                    </div>
                  )}

                  <div className="song-row__info">
                    <p className="song-row__title">{song.title}</p>
                    <p className="song-row__artist">{song.artist}</p>
                  </div>

                  <button
                    className="song-row__remove"
                    title="Xoá khỏi playlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSong(id, song._id);
                      setPlaylist((prev) => ({
                        ...prev,
                        songs: prev.songs.filter((s) => s._id !== song._id),
                      }));
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ GỢI Ý THÊM VÀO ══ */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          <div className="suggestions__header">
            <h2 className="suggestions__title">Gợi ý ({suggestions.length})</h2>
          </div>

          <div className="suggestions__list">
            {suggestions.map((song) => (
              <div key={song._id} className="suggestion-row">

                {song.coverUrl || song.imageUrl ? (
                  <img
                    src={song.coverUrl || song.imageUrl}
                    alt={song.title}
                    className="suggestion-row__thumb"
                  />
                ) : (
                  <div className="suggestion-row__thumb suggestion-row__thumb--placeholder">
                    <Music size={20} />
                  </div>
                )}

                <div className="suggestion-row__info">
                  <p className="suggestion-row__title">{song.title}</p>
                  <p className="suggestion-row__artist">{song.artist}</p>
                </div>

                <button
                  className="suggestion-row__add"
                  title="Thêm vào playlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: addSong(id, song._id)
                  }}
                >
                  + Thêm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ MODAL TẠO PLAYLIST ══ */}
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

                <label className="cpl-label">Mô tả (tuỳ chọn)</label>
                <textarea
                  className="cpl-textarea"
                  placeholder="Mô tả ngắn về playlist..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />

                {createError && <p className="cpl-error">{createError}</p>}
              </div>

              <div className="cpl-footer">
                <button className="cpl-btn cpl-btn--cancel" onClick={closeCreateModal}>
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
          document.body
        )}
    </div>
  );
}