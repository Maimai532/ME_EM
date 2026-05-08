import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import SongSection from "../components/song/SongSection";
// Mock data tạm — sau này thay bằng useEffect + axios
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
const styles = {
  content: {
    padding: "20px",
    minWidth: 0, //content div để nó không tràn qua Sidebar
    overflow: "hidden",
    margin: "0 0 0 150px", // đẩy content sang phải bằng marginLeft = width sidebar
  },
  log: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "5px",
  },
  logo: {
    width: "40px",
    height: "40px",
  },
  //sidebar
  sidebar: {
    width: "150px",
    minHeight: "100vh",
    backgroundColor: "#5594d4",
    borderRight: "1px solid #e4e4e7",
    padding: "5px",
    zIndex: 50,
    position: "fixed",
    top: 0,
    left: 0,
  },

  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  tag: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "5px",
    transition: "0.2s",
  },
};
function Admin() {
  //title page
  useEffect(() => {
    document.title = "Admin";
  }, []);
  const [isOpen, setIsOpen] = useState(true);
  const { isLoggedIn, logout } = useAuth();

  function handlePlay(song) {
    console.log("Phát bài:", song.title);
    // TODO: gọi playerContext.playSong(song) sau
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Sidebar cố định bên trái */}
      <aside style={styles.sidebar}>
        <div style={styles.log}>
          <img src="/logo.png" alt="Logo" style={styles.logo} />
        </div>
        <nav style={styles.navMenu}>
          <Link to="/Home" style={styles.tag} className="hover:bg-zinc-300">
            Home
          </Link>
          <Link
            to="/Song_Admin"
            style={styles.tag}
            className="hover:bg-zinc-300"
          >
            Song
          </Link>
          <Link
            to="/Playlist_Admin"
            style={styles.tag}
            className="hover:bg-zinc-300"
          >
            Playlist
          </Link>
          <Link
            to="/User_Admin"
            style={styles.tag}
            className="hover:bg-zinc-300"
          >
            User
          </Link>
          <Link to="/Login" style={styles.tag} className="hover:bg-zinc-300">
            Logout
          </Link>
        </nav>
      </aside>

      {/* Content đẩy sang phải bằng marginLeft = width sidebar */}
      <div style={styles.content}>
        <h1 className="text-2xl font-semibold text-blue-900">Kẻ thống trị</h1>

        <SongSection
          title="🔥 Đang Trending"
          songs={[...mockSongs].reverse()}
          onPlay={handlePlay}
        />
        <SongSection
          title="🎵 Mới Phát Hành"
          songs={mockSongs}
          onPlay={handlePlay}
        />
      </div>

      <footer className="w-full text-center p-4 bg-gray-200">
        <p className="text-sm text-gray-600">
          &copy; 2024 me_em. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Admin;
