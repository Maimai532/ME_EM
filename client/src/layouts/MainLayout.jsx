import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import "../styles/MainLayout.css";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const { isPlayerVisible } = usePlayer();

  return (
    <div className="main-layout">
      <Navbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />

      <div className="main-layout__row">
        <Sidebar isOpen={isOpen} />

        <main className={`main-layout__content ${isPlayerVisible ? "" : "main-layout__content--player-hidden"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;