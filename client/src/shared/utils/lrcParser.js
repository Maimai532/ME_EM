// utils/lrcParser.js

/**
 * Parse LRC file to get word-level timestamps
 * Supports both line-level and word-level LRC formats
 */
export function parseLRCToWords(lrcContent) {
  if (!lrcContent) return [];

  const lines = lrcContent.split('\n');
  const result = [];

  // Try to detect if it's word-level LRC
  const hasWordLevel = /\[\d{2}:\d{2}\.\d{2,3}\]\w+/.test(lrcContent);

  if (hasWordLevel) {
    // Parse word-level LRC
    const pattern = /\[(\d{2}):(\d{2})\.(\d{2,3})\]([^[]+)/g;
    let match;
    
    while ((match = pattern.exec(lrcContent)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + centiseconds / 1000;
      const text = match[4].trim();
      
      if (text) {
        result.push({ time, text, isWord: true });
      }
    }
  } else {
    // Parse line-level LRC
    for (const line of lines) {
      const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        const centiseconds = parseInt(timeMatch[3].padEnd(3, '0'));
        const time = minutes * 60 + seconds + centiseconds / 1000;
        const text = timeMatch[4].trim();
        
        if (text) {
          // Split text into words and assign approximate timings
          const words = text.split(/\s+/);
          if (words.length > 1) {
            // Assign each word with approximate timing
            const durationPerWord = 0.15; // 150ms per word
            words.forEach((word, index) => {
              result.push({
                time: time + (index * durationPerWord),
                text: word,
                isWord: true
              });
            });
          } else {
            result.push({ time, text, isWord: false });
          }
        }
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}