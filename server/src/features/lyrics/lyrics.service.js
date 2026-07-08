// lyrics.service.js
import axios from "axios";

export async function fetchLyricsFromLRCLIB({ trackName, artistName, duration }) {
  try {
    const searchRes = await axios.get("https://lrclib.net/api/search", {
      params: {
        q: `${artistName} - ${trackName}`
      }
    });

    if (!searchRes.data || searchRes.data.length === 0) {
      return { synced: [], plain: null };
    }

    const track = searchRes.data[0];
    const detailRes = await axios.get(`https://lrclib.net/api/get/${track.id}`);
    const data = detailRes.data;

    // Parse lyrics thành các dòng với timestamp
    const lineLyrics = parseLyricsToLines(data.syncedLyrics || data.plainLyrics);

    return {
      synced: lineLyrics,
      plain: data.plainLyrics,
      isWordLevel: false // Đánh dấu là line-level
    };
  } catch (error) {
    console.error("LRCLIB fetch error:", error.message);
    throw error;
  }
}

// Hàm parse LRC thành các dòng
function parseLyricsToLines(lrcContent) {
  if (!lrcContent) return [];

  const lines = lrcContent.split('\n');
  const lineTimings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Lấy timestamp của dòng hiện tại
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (!match) continue;

    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const centiseconds = parseInt(match[3].padEnd(3, '0'));
    const startTime = minutes * 60 + seconds + centiseconds / 1000;
    
    const text = match[4].trim();
    if (!text) continue;

    // Tìm thời gian kết thúc (thời gian của dòng tiếp theo)
    let endTime = startTime + 3; // Mặc định 3 giây
    
    for (let j = i + 1; j < lines.length; j++) {
      const nextMatch = lines[j].match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/);
      if (nextMatch) {
        const nextMinutes = parseInt(nextMatch[1]);
        const nextSeconds = parseInt(nextMatch[2]);
        const nextCentiseconds = parseInt(nextMatch[3].padEnd(3, '0'));
        endTime = nextMinutes * 60 + nextSeconds + nextCentiseconds / 1000;
        break;
      }
    }

    lineTimings.push({
      time: startTime,
      endTime: endTime,
      text: text,
      isLine: true
    });
  }

  return lineTimings.sort((a, b) => a.time - b.time);
}