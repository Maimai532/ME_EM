import { useEffect } from "react";

import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSections from "../hooks/useSections";

import SongSection from "../components/song/SongSection";
import ArtistSection from "../components/song/ArtistSection";

const mockArtists = [
  {
    _id: "1",
    name: "Sơn Tùng M-TP",
    imageUrl: "https://picsum.photos/seed/a1/300/300",
    followers: "18M followers",
  },
  {
    _id: "2",
    name: "MONO",
    imageUrl: "https://picsum.photos/seed/a2/300/300",
    followers: "5.2M followers",
  },
  {
    _id: "3",
    name: "Wren Evans",
    imageUrl: "https://picsum.photos/seed/a3/300/300",
    followers: "2.1M followers",
  },
  {
    _id: "4",
    name: "Vũ",
    imageUrl: "https://picsum.photos/seed/a4/300/300",
    followers: "3.8M followers",
  },
  {
    _id: "5",
    name: "HIEUTHUHAI",
    imageUrl: "https://picsum.photos/seed/a5/300/300",
    followers: "7.4M followers",
  },
  {
    _id: "6",
    name: "Hoàng Dũng",
    imageUrl: "https://picsum.photos/seed/a6/300/300",
    followers: "2.9M followers",
  },
  {
    _id: "7",
    name: "Orange",
    imageUrl: "https://picsum.photos/seed/a7/300/300",
    followers: "4.3M followers",
  },
  {
    _id: "8",
    name: "tlinh",
    imageUrl: "https://picsum.photos/seed/a8/300/300",
    followers: "6.1M followers",
  },
  {
    _id: "9",
    name: "MCK",
    imageUrl: "https://picsum.photos/seed/a9/300/300",
    followers: "5.5M followers",
  },
  {
    _id: "10",
    name: "Phương Ly",
    imageUrl: "https://picsum.photos/seed/a10/300/300",
    followers: "3.2M followers",
  },
  {
    _id: "11",
    name: "Đen Vâu",
    imageUrl: "https://picsum.photos/seed/a11/300/300",
    followers: "9.7M followers",
  },
];
const styles = {
  content: {
    padding: "20px",
    minWidth: 0, //content div để nó không tràn qua Sidebar
    overflow: "hidden",
  },
};
function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const { sections, loading } = useSections();
  //title page
  useEffect(() => {
    document.title = "Home";
  }, []);

  function handlePlay(song) {
    console.log("Phát bài:", song.title);
    // TODO: gọi playerContext.playSong(song) sau
  }

  return (
    <div className="min-h-screen w-full bg-white ">
      <Navbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
      />

      <div style={styles.page}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          <div style={styles.content}>
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
