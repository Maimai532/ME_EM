import User from "../../shared/models/User.js";
import bcrypt from "bcryptjs";

// GET /api/users — lấy danh sách tất cả user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // không trả password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// DELETE /api/users/:id — xoá user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Xoá user thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PATCH /api/users/:id/role — đổi role user/admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Cập nhật role thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET /api/users/me — lấy thông tin user đang đăng nhập
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PATCH /api/users/me — cập nhật thông tin cá nhân
export const updateMe = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Không cho để trống
    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Username và email không được để trống" });
    }

    const updateData = { username, email };

    // Nếu có upload ảnh mới
    if (req.file?.path) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PATCH /api/users/me/password — đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).json({ message: "Không được để trống" });
    }

    const user = await User.findById(req.user.id);

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải ít nhất 6 ký tự" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};