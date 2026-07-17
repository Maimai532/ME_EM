// user.controller.js
import User from "../../shared/models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { sendSuccess, sendError } from "../../shared/utils/responseHandler.js";
import { getPresignedUrl } from "../../shared/services/b2.service.js";

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

    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Username và email không được để trống" });
    }

    const updateData = { username, email };

    // Cloudinary storage lưu URL vào req.file.path, không có req.file.buffer
    if (req.file?.path) {
      updateData.avatar = req.file.path; // URL Cloudinary trả về
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

export const likeSong = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { songId } = req.params;
  const index = user.likedSongs.indexOf(songId);
  if (index === -1) {
    user.likedSongs.push(songId);
  } else {
    user.likedSongs.splice(index, 1);
  }
  await user.save();
  sendSuccess(res, { likedSongs: user.likedSongs });
});

export const getLikedSongs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "likedSongs",
    "title artist imageUrl audioUrl duration"
  );
  sendSuccess(res, user.likedSongs);
});

export const getFollowingArtists = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "followingArtists",
    "name avatar avatarKey country followers"
  );
  const artists = await Promise.all(
    (user.followingArtists ?? []).map(async (artist) => ({
      ...artist.toObject(),
      avatar: artist.avatarKey
        ? await getPresignedUrl(artist.avatarKey, 3600)
        : artist.avatar,
      followersCount: artist.followers?.length || 0,
    })),
  );

  sendSuccess(res, artists);
});
