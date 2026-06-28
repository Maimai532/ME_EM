// Levenshtein distance để tính độ tương đồng
function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarity(a, b) {
  const s1 = a.toLowerCase(),
    s2 = b.toLowerCase();
  if (s1.includes(s2) || s2.includes(s1)) return 1;
  const dist = levenshtein(s1, s2);
  return 1 - dist / Math.max(s1.length, s2.length);
}

// Fuzzy search trong toàn bộ danh sách bài hát
export async function getFuzzySuggestions(query, getAllSongs, limit = 8) {
  try {
    const allSongs = await getAllSongs();
    const q = query.toLowerCase();

    const scored = allSongs.map((song) => {
      const titleScore = similarity(song.title, q);
      const artistScore = similarity(song.artist || "", q);
      const score = Math.max(titleScore, artistScore * 0.8);
      return { song, score };
    });

    return scored
      .filter(({ score }) => score > 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ song }) => song);
  } catch {
    return [];
  }
}

// AI gợi ý — chỉ trả về bài CÓ trong hệ thống, dùng fuzzy để map tên AI gợi
export async function getAISuggestions(query, getAllSongs, limit = 8) {
  try {
    const [res, allSongs] = await Promise.all([
      fetch("http://localhost:8080/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: limit * 2 }), // lấy nhiều hơn để có dư sau filter
      }),
      getAllSongs(),
    ]);

    const data = await res.json();
    const aiNames = data.suggestions || []; // [{title, artist}] hoặc [string]

    // Map mỗi tên AI gợi với bài gần nhất trong DB
    const matched = [];
    const seenIds = new Set();

    for (const suggestion of aiNames) {
      const aiTitle =
        typeof suggestion === "string" ? suggestion : suggestion.title || "";
      const aiArtist =
        typeof suggestion === "string" ? "" : suggestion.artist || "";

      let bestSong = null;
      let bestScore = 0;

      for (const song of allSongs) {
        const titleScore = similarity(song.title, aiTitle);
        const artistScore = aiArtist
          ? similarity(song.artist || "", aiArtist)
          : 0;
        // Nặng hơn về title, artist là bonus
        const score = titleScore * 0.7 + artistScore * 0.3;

        if (score > bestScore) {
          bestScore = score;
          bestSong = song;
        }
      }

      // Chỉ lấy nếu match tạm được (> 0.3) và chưa có trong list
      if (bestSong && bestScore > 0.3 && !seenIds.has(bestSong._id)) {
        matched.push(bestSong);
        seenIds.add(bestSong._id);
      }

      if (matched.length >= limit) break;
    }

    return matched;
  } catch {
    return [];
  }
}