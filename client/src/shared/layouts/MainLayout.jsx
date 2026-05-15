import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { usePlayer } from "../../features/player/context/PlayerContext";

import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import "../styles/MainLayout.css";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const { isPlayerVisible } = usePlayer();

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
    </>
  );
}

export default MainLayout;
