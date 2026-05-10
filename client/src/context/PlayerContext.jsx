import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

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
  const audioRef = useRef(new Audio()); // ✅ chỉ khai báo 1 lần
  const audio = audioRef.current;

  const playSong = useCallback(
    (song, songList = []) => {
      if (!song) return;
      audio.src = song.audioUrl;
      audio.volume = volume;
      audio.play().catch(() => setIsPlaying(false));
      setCurrentSong(song);
      setIsPlaying(true);
      setCurrentTime(0);

      if (songList.length > 0) {
        setQueue(songList.filter((s) => s._id !== song._id));
      }

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.ondurationchange = () => setDuration(audio.duration);
      audio.onended = () => {
        if (isRepeat) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          playNext();
        }
      };
    },
    [volume, isRepeat],
  );

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
    if (queue.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextSong = queue[randomIndex];
      setQueue(queue.filter((_, i) => i !== randomIndex));
      playSong(nextSong);
    } else {
      const [nextSong, ...rest] = queue;
      setQueue(rest);
      playSong(nextSong);
    }
  }, [queue, isShuffle, playSong]);

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
    setQueue([]);
  }, []);

  const toggleRepeat = () => setIsRepeat((v) => !v);
  const toggleShuffle = () => setIsShuffle((v) => !v);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, queue, isPlaying, currentTime, duration,
        volume, isRepeat, isShuffle,
        playSong, togglePlay, playNext, playPrev,
        seek, changeVolume, toggleRepeat, toggleShuffle,
        setQueue, stopPlayer,
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