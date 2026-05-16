import { useState } from "react";
import { artistService } from "../../../shared/services/artist.service";

export default function ArtistForm({ artist, onSaved, onCancel }) {
  const isEdit = !!artist;
  const [form, setForm] = useState({
    name: artist?.name || "",
    country: artist?.country || "",
    description: artist?.description || "",
    avatarUrl: artist?.avatar || "", // URL avatar
  });
  const [avatarMode, setAvatarMode] = useState("url"); // "url" | "file"
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(artist?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [autoLinked, setAutoLinked] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Preview realtime khi nhập URL
    if (name === "avatarUrl") {
      setPreview(value);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ← chặn double submit
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
        onSaved(); // đóng modal ngay
      } else {
        const res = await artistService.create(formData);
        const linked = res.data.autoLinked || 0;
        if (linked > 0) {
          setAutoLinked(linked);
          setLoading(false); // ← reset loading trước khi setTimeout
          setTimeout(onSaved, 2000);
        } else {
          onSaved(); // đóng modal ngay
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (
        msg.includes("đã tồn tại") ||
        msg.includes("duplicate") ||
        err.response?.status === 400
      ) {
        alert("Nghệ sĩ này đã tồn tại trong hệ thống!");
      } else {
        alert(msg || "Lỗi khi lưu nghệ sĩ");
      }
      setLoading(false);
    } finally {
      // không dùng finally vì autoLinked case cần setLoading(false) thủ công trước setTimeout
    }
  };

  return (
    <div className="artist-form">
      <div className="artist-form__header">
        {/* <h2>{isEdit ? "Sửa nghệ sĩ" : "Thêm nghệ sĩ mới"}</h2> */}
        {/* <button onClick={onCancel}>← Quay lại</button> */}
      </div>

      {autoLinked !== null && (
        <div className="alert alert--success">
          ✓ Đã tự động liên kết {autoLinked} bài hát có sẵn vào nghệ sĩ này!
        </div>
      )}

      <form onSubmit={handleSubmit} className="artist-form__body">
        {/* Avatar */}
        <div className="form-group">
          <label>Avata</label>

          {/* Toggle URL / File */}
          <div className="avatar-mode-toggle">
            <button
              type="button"
              className={avatarMode === "url" ? "active" : ""}
              onClick={() => setAvatarMode("url")}
            >
              Nhập URL
            </button>
            <button
              type="button"
              className={avatarMode === "file" ? "active" : ""}
              onClick={() => setAvatarMode("file")}
            >
              Upload file
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="artist-form__preview"
              onError={() => setPreview("")} // ẩn nếu URL lỗi
            />
          )}

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
