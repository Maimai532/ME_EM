import express from "express";

const router = express.Router();

router.post("/suggest", async (req, res) => {
  const { query, limit = 5 } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              'You are a music recommendation API. You ONLY output raw valid JSON. No markdown, no backticks, no explanation, no single quotes. Always use double quotes for all strings.',
          },
          {
            role: "user",
            content: `Suggest ${limit} songs similar to "${query}". Reply with ONLY this JSON structure, nothing else:\n{"suggestions":[{"title":"Song Title","artist":"Artist Name"}]}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    // Làm sạch output
    const cleaned = raw
      .replace(/```json|```/g, "")
      .replace(/'/g, '"')   // đổi single quote thành double quote
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: extract bằng regex nếu JSON vẫn lỗi
      const titles = [...cleaned.matchAll(/"title"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
      const artists = [...cleaned.matchAll(/"artist"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
      const suggestions = titles.map((title, i) => ({
        title,
        artist: artists[i] || "",
      }));
      parsed = { suggestions };
    }

    res.json({ suggestions: parsed.suggestions || [] });
  } catch (err) {
    console.error("AI suggest error:", err.message);
    res.json({ suggestions: [] });
  }
});

export default router;