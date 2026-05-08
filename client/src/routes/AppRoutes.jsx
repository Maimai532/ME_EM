import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import Library from "../pages/Library";
import Playlist_Admin from "../pages/Playlist_Admin";
import Song_Admin from "../pages/Song_Admin";
import User_Admin from "../pages/User_Admin";

//Muốn truy cập URL nào → phải khai báo Route cho URL đó
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/library" element={<Library />} />
          <Route path="/favorite" element={<Library />} />
          <Route path="/history" element={<Library />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/playlist-admin" element={<Playlist_Admin />} />
          <Route path="/song-admin" element={<Song_Admin />} />
          <Route path="/user-admin" element={<User_Admin />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
