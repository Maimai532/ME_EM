import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { addToHistory } from "../../../shared/services/history.service";
import { getSongById } from "../../home/services/songService";
import { getRandomSongs } from "../../home/services/songService";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
  const audioRef = useRef(new Audio());
  const audio = audioRef.current;
  const queueRef = useRef([]);
  const currentSongRef = useRef(null);
  const historyRef = useRef([]);
  const isRepeatRef = useRef(false);
  const isShuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const fallbackListRef = useRef([]);
  const fallbackIndexRef = useRef(0);
  const playNextRef = useRef(null);
  const [fallbackList, setFallbackListState] = useState([]);

  const setFallbackList = useCallback((list) => {
    fallbackListRef.current = list;
  }, []);

  const updateQueue = useCallback((newQueue) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  const playSong = useCallback(
    async (
      song,
      songList = [],
      skipHistory = false,
      skipFallbackUpdate = false,
      isFallbackPlay = false,
    ) => {
      if (!song) return;

      // Update fallback list — chỉ reset index khi user chủ động chọn
      if (songList.length > 0 && !skipFallbackUpdate) {
        fallbackListRef.current = songList;
        if (!isFallbackPlay) {
          fallbackIndexRef.current = 0;
        }
      }

      // Push history trừ khi đang đi prev
      if (
        !skipHistory &&
        currentSongRef.current &&
        currentSongRef.current._id !== song._id
      ) {
        historyRef.current = [...historyRef.current, currentSongRef.current];
      }

      // Reset audio trước khi load bài mới
      audio.pause();
      audio.src = "";

      // Fetch fresh presigned URL
      let src;
      try {
        const fresh = await getSongById(song._id);
        src = fresh.streamUrl || fresh.audioUrl;
      } catch {
        src = song.streamUrl || song.audioUrl;
      }

      if (!src) return console.warn("Không có URL để play:", song.title);

      const remaining = songList.filter((s) => s._id !== song._id);
      updateQueue(remaining);

      audio.src = src;
      audio.volume = volumeRef.current;

      audio.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Play error:", err);
          setIsPlaying(false);
        }
      });

      setCurrentSong(song);
      currentSongRef.current = song;
      setIsPlaying(true);
      setCurrentTime(0);
      setIsMusicPlayerVisible(true);

      try {
        addToHistory(song._id);
      } catch {
        /* chưa login */
      }

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.ondurationchange = () => setDuration(audio.duration);
    },
    [updateQueue],
  );

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;

    // Queue rỗng — fetch list random mới thay vì dùng fallback cũ
    if (currentQueue.length === 0) {
      getRandomSongs(Math.floor(Math.random() * 6) + 10) // 10-15 bài
        .then((newList) => {
          if (!newList || newList.length === 0) return;

          fallbackListRef.current = newList;
          setFallbackListState(newList);
          fallbackIndexRef.current = 1;

          const firstSong = isShuffleRef.current
            ? newList[Math.floor(Math.random() * newList.length)]
            : newList[0];

          const remaining = newList.filter((s) => s._id !== firstSong._id);

          updateQueue(remaining);
          playSong(firstSong, newList, false, true, true);
        })
        .catch(console.error);
      return;
    }

    // Queue còn bài — logic cũ giữ nguyên
    if (currentSongRef.current) {
      historyRef.current = [...historyRef.current, currentSongRef.current];
    }

    let nextSong;
    let remaining;

    if (isShuffleRef.current) {
      const idx = Math.floor(Math.random() * currentQueue.length);
      nextSong = currentQueue[idx];
      remaining = currentQueue.filter((_, i) => i !== idx);
    } else {
      [nextSong, ...remaining] = currentQueue;
    }

    updateQueue(remaining);
    playSong(nextSong, [nextSong, ...remaining], false, true);
  }, [playSong, updateQueue]);

  playNextRef.current = playNext;

  const playPrev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const history = historyRef.current;

    if (history.length === 0) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevSong = history[history.length - 1];
    historyRef.current = history.slice(0, -1);

    if (currentSongRef.current) {
      const newQueue = [
        currentSongRef.current,
        ...queueRef.current.filter((s) => s._id !== currentSongRef.current._id),
      ];
      updateQueue(newQueue);
    }

    playSong(prevSong, [], true, true); // skipHistory + skipFallbackUpdate
  }, [playSong, updateQueue]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const toggleRepeat = useCallback(() => {
    const next = !isRepeatRef.current;
    isRepeatRef.current = next;
    setIsRepeat(next);
    if (next) {
      isShuffleRef.current = false;
      setIsShuffle(false);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    const next = !isShuffleRef.current;
    isShuffleRef.current = next;
    setIsShuffle(next);
    if (next) {
      isRepeatRef.current = false;
      setIsRepeat(false);
    }
  }, []);

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((val) => {
    volumeRef.current = val;
    audio.volume = val;
    setVolume(val);
  }, []);

  const stopPlayer = useCallback(() => {
    audio.pause();
    audio.src = "";
    setCurrentSong(null);
    currentSongRef.current = null;
    historyRef.current = [];
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    updateQueue([]);
  }, [updateQueue]);

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      playNextRef.current?.();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []); // deps rỗng — chỉ add 1 lần

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isRepeat,
        isShuffle,
        playSong,
        playNext,
        playPrev,
        togglePlay,
        toggleRepeat,
        toggleShuffle,
        seek,
        changeVolume,
        setQueue: updateQueue,
        stopPlayer,
        isPlayerVisible,
        setIsPlayerVisible,
        isMusicPlayerVisible,
        setIsMusicPlayerVisible,
        setFallbackList,
        fallbackList,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
