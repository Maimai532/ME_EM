import { useState } from "react";
import { artistService } from "../../../shared/services/artist.service";

export default function AddAlbumModal({ artistId, onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", releaseYear: "", description: "" });
  const [coverMode, setCoverMode] = useState("url"); // "url" | "file"
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!form.title.trim()) return alert("Cần có tên album");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("releaseYear", form.releaseYear);
      formData.append("description", form.description);

      if (coverMode === "file" && coverFile) {
        formData.append("coverImage", coverFile);       // multer nhận file
      } else if (coverMode === "url" && coverUrl) {
        formData.append("coverImage", coverUrl);        // BE nhận req.body.coverImage
      }

      await artistService.addAlbum(artistId, formData);
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>New Album</h3>
          <button onClick={onClose}>✕</button>
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
              onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
              placeholder="2024"
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Ảnh bìa */}
          <div className="form-group">
            <label>Ảnh bìa album</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => { setCoverMode("url"); setCoverFile(null); setPreview(coverUrl); }}
                style={{ fontWeight: coverMode === "url" ? 700 : 400 }}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => { setCoverMode("file"); setCoverUrl(""); setPreview(""); }}
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
                className="artist-form__preview"
                onError={() => setPreview("")}
              />
            )}
          </div>

          <div className="modal__footer">
            <button type="button" onClick={onClose}>Hủy</button>
            <button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}