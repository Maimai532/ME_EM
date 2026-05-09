import express from "express";

const router = express.Router();

// Kiểm tra server có đang chạy không
router.get("/", (req, res) => {
  res.json({ success: true, message: "Server đang chạy!" });
});

export default router;