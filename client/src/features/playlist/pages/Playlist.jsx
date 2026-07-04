import "../styles/Playlist.css";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Trash2, ArrowLeft, Music } from "lucide-react";
import { usePlayer } from "../../player/context/PlayerContext";
import { usePlaylist } from "../context/PlaylistContext";
import * as playlistService from "../services/playlistService";

export default function Playlist() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const { removeSong } = usePlaylist();
  const [playlist, setPlaylist] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) return <p style={{ padding: 32, color: "#fff" }}>Đang tải...</p>;
  if (!playlist)
    return (
      <p style={{ padding: 32, color: "#fff" }}>Không tìm thấy playlist</p>
    );

  const songs = playlist.songs ?? [];

  return (
    <div className="playlist-page">
      <button className="playlist__back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="playlist__hero">
        <div className="playlist__hero-info">
          {/* {playlist.imageUrl ? (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="playlist__avatar"
            />
          ) : (
            <div className="playlist__avatar-placeholder">
              <Music size={36} />
            </div>
          )} */}

          <div className="playlist__text">
            <h1 className="playlist__name">{playlist.name}</h1>
            {playlist.description && (
              <p className="playlist__meta">{playlist.description}</p>
            )}
            <p className="playlist__meta" style={{ marginTop: 6 }}>
              {songs.length} bài hát
            </p>
            {songs.length > 0 && (
              <button
                className="playlist__play-all"
                onClick={() => playSong(songs[0], songs)}
              >
                <Play size={16} fill="currentColor" />
                Phát tất cả
              </button>
            )}
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
                <img
                  src={song.coverUrl || song.imageUrl || "/placeholder.jpg"}
                  alt={song.title}
                  className="suggestion-row__thumb"
                />

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
    </div>
  );
}
