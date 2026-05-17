import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { addToHistory } from "../../../shared/services/history.service";

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
  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  const queueRef = useRef([]);
  const isRepeatRef = useRef(false);
  const isShuffleRef = useRef(false);
  const volumeRef = useRef(0.8);
  const currentSongRef = useRef(null);
  const historyRef = useRef([]);

  const updateQueue = useCallback((newQueue) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  // Repeat và shuffle loại trừ nhau
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

  const playSong = useCallback(
    (song, songList = []) => {
      if (!song) return;

      audio.src = song.audioUrl;
      audio.volume = volumeRef.current;
      audio.play().catch(() => setIsPlaying(false));
      setCurrentSong(song);
      currentSongRef.current = song;
      setIsPlaying(true);
      setCurrentTime(0);

      addToHistory(song._id);

      if (songList.length > 0) {
        const newQueue = songList.filter((s) => s._id !== song._id);
        updateQueue(newQueue);
      }

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.ondurationchange = () => setDuration(audio.duration);
    },
    [updateQueue],
  );

// useEffect 1: xử lý onended
  useEffect(() => {
    audio.onended = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) return;

      if (currentSongRef.current) {
        historyRef.current = [...historyRef.current, currentSongRef.current];
      }

      let nextSong, remaining;
      if (isShuffleRef.current) {
        const idx = Math.floor(Math.random() * currentQueue.length);
        nextSong = currentQueue[idx];
        remaining = currentQueue.filter((_, i) => i !== idx);
      } else {
        [nextSong, ...remaining] = currentQueue;
      }

      queueRef.current = remaining;
      setQueue(remaining);
      currentSongRef.current = nextSong;

      audio.src = nextSong.audioUrl;
      audio.volume = volumeRef.current;
      audio.play().catch(() => setIsPlaying(false));
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setCurrentTime(0);

      addToHistory(nextSong._id);
    };
  }, []);

// useEffect 2: sync isPlaying với trạng thái thực của audio
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

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;

    // Lưu bài hiện tại vào history
    if (currentSongRef.current) {
      historyRef.current = [...historyRef.current, currentSongRef.current];
    }

    let nextSong, remaining;
    if (isShuffleRef.current) {
      const idx = Math.floor(Math.random() * currentQueue.length);
      nextSong = currentQueue[idx];
      remaining = currentQueue.filter((_, i) => i !== idx);
    } else {
      [nextSong, ...remaining] = currentQueue;
    }

    updateQueue(remaining);
    playSong(nextSong);
  }, [playSong, updateQueue]);

  const playPrev = useCallback(() => {
    // Nếu đang nghe quá 3s → restart bài hiện tại
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    // Lấy bài trước từ history
    const history = historyRef.current;
    if (history.length === 0) {
      // Không có lịch sử → restart bài hiện tại
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevSong = history[history.length - 1];
    historyRef.current = history.slice(0, -1);

    // Đưa bài hiện tại trở lại đầu queue
    if (currentSongRef.current) {
      const newQueue = [currentSongRef.current, ...queueRef.current];
      updateQueue(newQueue);
    }

    playSong(prevSong);
  }, [playSong, updateQueue]);

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
        togglePlay,
        playNext,
        playPrev,
        seek,
        changeVolume,
        toggleRepeat,
        toggleShuffle,
        setQueue: updateQueue,
        stopPlayer,
        isPlayerVisible,
        setIsPlayerVisible,
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
