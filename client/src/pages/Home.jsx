import { useEffect } from "react";

import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSections from "../hooks/useSections";

import SongSection from "../components/song/SongSection";
import "../styles/Home.css";

function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const { sections, loading } = useSections();

  useEffect(() => {
    document.title = "Home";
  }, []);

  return (
    <div className="min-h-screen w-full bg-white ">
      <Navbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />

      <div className="home-page">
        <div className="home-page__row">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          <div className="home-page__content">
            <h1 className="text-2xl font-semibold text-blue-900 ">
              Nghe nhạc bằng cả tính mạng
            </h1>
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              sections.map((section) => (
                <SongSection
                  key={section._id}
                  title={section.name}
                  songs={section.songs}
                  layout={section.layout}
                  songList={section.songs}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="w-full text-center p-4 bg-gray-200">
        <p className="text-sm text-gray-600">
          &copy; 2024 me_em. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
