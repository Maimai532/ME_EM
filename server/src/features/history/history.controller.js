import History from "../../shared/models/history.model.js";

export const addHistory = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.id; // ← khớp với decoded.id trong middleware

    const entry = await History.create({ userId, songId });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query;

    const now = new Date();
    let fromDate;

    if (filter === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === "7days") {
      fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else {
      fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const histories = await History.find({
      userId,
      listenedAt: { $gte: fromDate },
    })
      .populate("songId")
      .sort({ listenedAt: -1 });

    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query = { userId };

    if (type === "7days") {
      query.listenedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    await History.deleteMany(query);
    res.json({ message: "Đã xoá lịch sử" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};