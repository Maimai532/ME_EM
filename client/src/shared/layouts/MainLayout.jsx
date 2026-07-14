import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { usePlayer } from "../../features/player/context/PlayerContext";
import { useState, useEffect } from "react";
import PlayerOSD from "../../features/player/components/PlayerOSD";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PlayerBar from "../../features/player/components/PlayerBar";
import MusicPlayer from "../../features/player/pages/MusicPlayer";
import "../styles/MainLayout.css";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const { isPlayerVisible, isMusicPlayerVisible, setIsMusicPlayerVisible } =
    usePlayer();
  const location = useLocation();
  useKeyboardShortcuts();

  // Ẩn MusicPlayer khi đổi route
  useEffect(() => {
    setIsMusicPlayerVisible(false);
  }, [location.pathname]);

  // Lock scroll khi MusicPlayer visible
  useEffect(() => {
    document.body.style.overflow = isMusicPlayerVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMusicPlayerVisible]);

  return (
    <>
      <Navbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />
      <Sidebar isOpen={isOpen} />

      <main
        className={`main-layout__content ${isPlayerVisible ? "" : "main-layout__content--player-hidden"}`}
      >
        <Outlet />
      </main>

      <div
        className={`music-player-overlay ${!isMusicPlayerVisible ? "music-player-overlay--hidden" : ""}`}
      >
        <MusicPlayer />
      </div>
      <PlayerBar />
      <PlayerOSD />

      <PlayerBar />
    </>
  );
}

export default MainLayout;
