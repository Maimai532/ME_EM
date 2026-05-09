import { useEffect } from "react";

import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSections from "../hooks/useSections";

import SongSection from "../components/song/SongSection";
import ArtistSection from "../components/song/ArtistSection";

const mockSongs = [
  {
    _id: "1",
    title: "Chạy Ngay Đi",
    artist: "Sơn Tùng M-TP",
    imageUrl: "https://picsum.photos/seed/s1/200/200",
  },
  {
    _id: "2",
    title: "Hoa Nở Không Màu",
    artist: "Hoài Lâm",
    imageUrl: "https://picsum.photos/seed/s2/200/200",
  },
  {
    _id: "3",
    title: "Người Lạ Ơi",
    artist: "Karik ft Orange",
    imageUrl: "https://picsum.photos/seed/s3/200/200",
  },
  {
    _id: "4",
    title: "Đừng Làm Trái Tim Anh Đau",
    artist: "Sơn Tùng M-TP",
    imageUrl: "https://picsum.photos/seed/s4/200/200",
  },
  {
    _id: "5",
    title: "Có Chắc Yêu Là Đây",
    artist: "Sơn Tùng M-TP",
    imageUrl: "https://picsum.photos/seed/s5/200/200",
  },
  {
    _id: "6",
    title: "Waiting For You",
    artist: "MONO",
    imageUrl: "https://picsum.photos/seed/s6/200/200",
  },
  {
    _id: "7",
    title: "Em Gái Mưa",
    artist: "Hương Tràm",
    imageUrl: "https://picsum.photos/seed/s7/200/200",
  },
  {
    _id: "8",
    title: "Bạc Phận",
    artist: "Jack ft K-ICM",
    imageUrl: "https://picsum.photos/seed/s8/200/200",
  },
  {
    _id: "9",
    title: "Muộn Rồi Mà Sao Còn",
    artist: "Sơn Tùng M-TP",
    imageUrl: "https://picsum.photos/seed/s9/200/200",
  },
  {
    _id: "10",
    title: "Thích Em Hơi Nhiều",
    artist: "Wren Evans",
    imageUrl: "https://picsum.photos/seed/s10/200/200",
  },
  {
    _id: "11",
    title: "Lạ Lùng",
    artist: "Vũ",
    imageUrl: "https://picsum.photos/seed/s11/200/200",
  },
];

const mockSections = [
  {
    _id: "sec1",
    name: "Xu hướng",
    layout: "scroll",
    songs: mockSongs.slice(0, 6),
  },
  {
    _id: "sec2",
    name: "Nổi bật",
    layout: "grid",
    songs: mockSongs.slice(3, 9),
  },
  {
    _id: "sec3",
    name: "Nghe lại",
    layout: "list",
    songs: mockSongs.slice(6, 11),
  },
];

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

      <div style={{ paddingTop: "64px" }}>
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
                  onPlay={handlePlay}
                />
              ))
            )}

            <ArtistSection
              layout="scroll"
              title="Nghệ sĩ nổi bật"
              artist={mockArtists}
            />
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
