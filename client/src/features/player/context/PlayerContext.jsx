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

  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);

  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  const queueRef = useRef([]);
  const currentSongRef = useRef(null);
  const historyRef = useRef([]);

  const isRepeatRef = useRef(false);
  const isShuffleRef = useRef(false);
  const volumeRef = useRef(0.8);

  // =========================
  // QUEUE
  // =========================

  const updateQueue = useCallback((newQueue) => {
    queueRef.current = newQueue;
    setQueue(newQueue);
  }, []);

  // =========================
  // PLAY SONG
  // =========================

  const playSong = useCallback((song) => {
    if (!song) return;

    audio.src = song.audioUrl;
    audio.volume = volumeRef.current;

    audio.play().catch((err) => {
      console.error(err);
      setIsPlaying(false);
    });

    setCurrentSong(song);
    currentSongRef.current = song;

    setIsPlaying(true);
    setCurrentTime(0);

    setIsMusicPlayerVisible(true);

    addToHistory(song._id);

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.ondurationchange = () => {
      setDuration(audio.duration);
    };
  }, []);

  // =========================
  // NEXT SONG
  // =========================

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) return;

    // save history
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

    playSong(nextSong);
  }, [playSong, updateQueue]);

  // =========================
  // PREV SONG
  // =========================

  const playPrev = useCallback(() => {
    // nếu nghe >3s thì restart
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

    // đưa current song về đầu queue
    if (currentSongRef.current) {
      const newQueue = [
        currentSongRef.current,
        ...queueRef.current.filter((s) => s._id !== currentSongRef.current._id),
      ];

      updateQueue(newQueue);
    }

    playSong(prevSong);
  }, [playSong, updateQueue]);

  // =========================
  // PLAY / PAUSE
  // =========================

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        setIsPlaying(false);
      });

      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  // =========================
  // REPEAT
  // =========================

  const toggleRepeat = useCallback(() => {
    const next = !isRepeatRef.current;

    isRepeatRef.current = next;
    setIsRepeat(next);

    // repeat và shuffle loại trừ nhau
    if (next) {
      isShuffleRef.current = false;
      setIsShuffle(false);
    }
  }, []);

  // =========================
  // SHUFFLE
  // =========================

  const toggleShuffle = useCallback(() => {
    const next = !isShuffleRef.current;

    isShuffleRef.current = next;
    setIsShuffle(next);

    // repeat và shuffle loại trừ nhau
    if (next) {
      isRepeatRef.current = false;
      setIsRepeat(false);
    }
  }, []);

  // =========================
  // SEEK
  // =========================

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  // =========================
  // VOLUME
  // =========================

  const changeVolume = useCallback((val) => {
    volumeRef.current = val;

    audio.volume = val;

    setVolume(val);
  }, []);

  // =========================
  // STOP PLAYER
  // =========================

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

  // =========================
  // AUTO NEXT WHEN ENDED
  // =========================

  useEffect(() => {
    const handleEnded = () => {
      // repeat current song
      if (isRepeatRef.current) {
        audio.currentTime = 0;

        audio.play().catch(() => {});

        return;
      }

      playNext();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  // =========================
  // SYNC PLAY STATE
  // =========================

  useEffect(() => {
    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);

  if (!ctx) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }

  return ctx;
}
