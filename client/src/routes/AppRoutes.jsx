import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import Playlist_Admin from "../pages/Playlist_Admin";
import Song_Admin from "../pages/Song_Admin";
import User_Admin from "../pages/User_Admin";


//Muốn truy cập URL nào → phải khai báo Route cho URL đó
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/Profile" element={<Profile/>} />
          <Route path="/Playlist" element={<Playlist />} />
          <Route path="/Playlist_Admin" element={<Playlist_Admin />} />
          <Route path="/Song_Admin" element={<Song_Admin />} />
          <Route path="/User_Admin" element={<User_Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;