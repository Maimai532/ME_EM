import Song from "../../shared/models/Song.js";
import User from "../../shared/models/User.js";
import Artist from "../../shared/models/artist.model.js";
import Playlist from "../../shared/models/Playlist.js";
import History from "../../shared/models/history.model.js";

export async function getDashboardStats(req, res) {
  try {
    const days = Number(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [
      totalSongs,
      totalUsers,
      totalArtists,
      totalPlaylists,
      newUsers,
      totalPlaysAgg,
      missingData,
      topSongs,
      topArtists,
      playsTimeline,
      recentUsers,
      recentSongs,
    ] = await Promise.all([
      Song.countDocuments(),
      User.countDocuments(),
      Artist.countDocuments(),
      Playlist.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since } }),

      Song.aggregate([{ $group: { _id: null, total: { $sum: "$plays" } } }]),

      // Đếm dữ liệu thiếu — dùng $facet để chỉ 1 lượt quét
      // Đếm dữ liệu thiếu — có xét ảnh kế thừa từ album
      Song.aggregate([
        {
          $facet: {
            missingImage: [
              {
                $lookup: {
                  from: "albums",
                  let: { albumId: "$albumId", albumTitle: "$album" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $or: [
                            { $eq: ["$_id", "$$albumId"] },
                            {
                              $and: [
                                { $ne: ["$$albumTitle", ""] },
                                { $eq: ["$title", "$$albumTitle"] },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                    { $project: { coverImage: 1 } },
                  ],
                  as: "albumInfo",
                },
              },
              {
                $addFields: {
                  effectiveImage: {
                    $cond: [
                      { $ne: ["$imageUrl", ""] },
                      "$imageUrl",
                      { $arrayElemAt: ["$albumInfo.coverImage", 0] },
                    ],
                  },
                },
              },
              {
                $match: {
                  $or: [{ effectiveImage: { $in: [null, ""] } }],
                },
              },
              { $count: "count" },
            ],
            missingAudio: [
              {
                $match: {
                  $and: [
                    { audioUrl: { $in: [null, ""] } },
                    { audioKey: { $in: [null, ""] } },
                  ],
                },
              },
              { $count: "count" },
            ],
            missingGenre: [
              { $match: { genre: { $in: [null, ""] } } },
              { $count: "count" },
            ],
          },
        },
      ]),

      Song.find()
        .sort({ plays: -1 })
        .limit(10)
        .select("title artist plays imageUrl"),

      // Top nghệ sĩ theo tổng plays của các bài hát thuộc nghệ sĩ đó
      Song.aggregate([
        { $match: { artistId: { $ne: null } } },
        { $group: { _id: "$artistId", totalPlays: { $sum: "$plays" } } },
        { $sort: { totalPlays: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "artists",
            localField: "_id",
            foreignField: "_id",
            as: "artist",
          },
        },
        { $unwind: "$artist" },
        {
          $project: {
            name: "$artist.name",
            avatar: "$artist.avatar",
            totalPlays: 1,
          },
        },
      ]),

      History.aggregate([
        { $match: { playedAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$playedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username email createdAt"),
      Song.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title artist createdAt"),
    ]);

    res.json({
      totals: {
        songs: totalSongs,
        users: totalUsers,
        artists: totalArtists,
        playlists: totalPlaylists,
        plays: totalPlaysAgg[0]?.total || 0,
        newUsers,
      },
      missingData: {
        image: missingData[0]?.missingImage[0]?.count || 0,
        audio: missingData[0]?.missingAudio[0]?.count || 0,
        genre: missingData[0]?.missingGenre[0]?.count || 0,
      },
      topSongs,
      topArtists,
      playsTimeline, // [{ _id: "2026-07-10", count: 42 }, ...]
      recentUsers,
      recentSongs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tải thống kê" });
  }
}
