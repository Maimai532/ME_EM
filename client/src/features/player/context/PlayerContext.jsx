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

  // Ref luôn giữ giá trị mới nhất — tránh stale closure
  const queueRef = useRef([]);
  const isRepeatRef = useRef(false);
  const isShuffleRef = useRef(false);
  const volumeRef = useRef(0.8);

  const updateQueue = useCallback((newQueue) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  const toggleRepeat = useCallback(() => {
    const next = !isRepeatRef.current;
    isRepeatRef.current = next;
    setIsRepeat(next);
  }, []);

  const toggleShuffle = useCallback(() => {
    const next = !isShuffleRef.current;
    isShuffleRef.current = next;
    setIsShuffle(next);
  }, []);

  // playSong KHÔNG dùng queue/isRepeat từ closure — chỉ dùng ref
  const playSong = useCallback(
    (song, songList = []) => {
      if (!song) return;

      audio.src = song.audioUrl;
      audio.volume = volumeRef.current;
      audio.play().catch(() => setIsPlaying(false));
      setCurrentSong(song);
      setIsPlaying(true);
      setCurrentTime(0);

      addToHistory(song._id);// ghi lịch sử, không cần await

      // Chỉ reset queue khi truyền songList mới
      if (songList.length > 0) {
        const newQueue = songList.filter((s) => s._id !== song._id);
        updateQueue(newQueue);
      }

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.ondurationchange = () => setDuration(audio.duration);
    },
    [updateQueue],
  );

  // onended tách riêng bằng useEffect — luôn đọc ref mới nhất
  useEffect(() => {
    audio.onended = () => {
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const currentQueue = queueRef.current;
      if (currentQueue.length === 0) return;

      let nextSong, remaining;
      if (isShuffleRef.current) {
        const idx = Math.floor(Math.random() * currentQueue.length);
        nextSong = currentQueue[idx];
        remaining = currentQueue.filter((_, i) => i !== idx);
      } else {
        [nextSong, ...remaining] = currentQueue;
      }

      // Cập nhật queue trước, rồi mới play
      queueRef.current = remaining;
      setQueue(remaining);

      // Play trực tiếp qua audio, không gọi playSong (tránh reset queue)
      audio.src = nextSong.audioUrl;
      audio.volume = volumeRef.current;
      audio.play().catch(() => setIsPlaying(false));
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setCurrentTime(0);
    };
  }, []); // chạy 1 lần, luôn đọc ref mới nhất

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
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
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
