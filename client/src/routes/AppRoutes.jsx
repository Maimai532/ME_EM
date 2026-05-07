import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import Playlist from "../pages/Playlist";
import Library from "../pages/Library";


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
          <Route path="/Library" element={<Library />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;