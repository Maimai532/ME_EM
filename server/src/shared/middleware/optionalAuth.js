import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Không chặn nếu thiếu/token lỗi — chỉ gắn req.user nếu hợp lệ
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (error) {
    // token hết hạn/không hợp lệ -> coi như guest, không throw
  }
  next();
};