// import { Input, Button, Dropdown } from "antd";
// import { DownOutlined } from "@ant-design/icons";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../auth/context/AuthContext";
// import { useState, useEffect } from "react";
// import "../styles/Navbar_Admin.css";

// function Navbar_Admin({ isOpen, setIsOpen }) {
//   const navigate = useNavigate();
//   const { isLoggedIn, logout } = useAuth();
//   const userMenuItems = [
//     { key: "1", label: <Link to="/profile">Profile</Link> },
//     { key: "2", label: <Link to="/settings">Settings</Link> },
//     {
//       key: "3",
//       label: (
//         <span onClick={logout} className="navbar-admin__logout-link" role="presentation">
//           Logout
//         </span>
//       ),
//     },
//   ];

//   const [visible, setVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);

//   useEffect(() => {
//     function handleScroll() {
//       const currentY = window.scrollY;

//       if (currentY < 10) {
//         setVisible(true);
//       } else if (currentY < lastScrollY) {
//         setVisible(true);
//       } else {
//         setVisible(false);
//       }

//       setLastScrollY(currentY);
//     }

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [lastScrollY]);

//   return (
//     <nav
//       className={`navbar-admin-shell ${
//         visible ? "navbar-admin-shell--visible" : "navbar-admin-shell--hidden"
//       }`}
//     >
//       <header className="navbar-admin">
//         <div className="flex items-center gap-4">
//           <img
//             src="/logo.png"
//             alt="Logo"
//             className="navbar-admin__logo"
//             onClick={() => setIsOpen(!isOpen)}
//           />
//         </div>

//         <nav className="navbar-admin__nav-menu">
//           <div className="navbar-admin__search-wrap">
//             <Input type="search" placeholder="Search..." />
//           </div>
//         </nav>

//         <div className="navbar-admin__primary-buttons">
//           {isLoggedIn ? (
//             <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
//               <Button>
//                 You <DownOutlined />
//               </Button>
//             </Dropdown>
//           ) : (
//             <>
//               <Button
//                 type="primary"
//                 className="navbar-admin__btn"
//                 onClick={() => navigate("/login")}
//               >
//                 Login
//               </Button>

//               <Button
//                 type="primary"
//                 className="navbar-admin__btn"
//                 onClick={() => navigate("/register")}
//               >
//                 Register
//               </Button>
//               <Button
//                 type="primary"
//                 className="navbar-admin__btn"
//                 onClick={() => navigate("/admin")}
//               >
//                 Admin
//               </Button>
//             </>
//           )}
//         </div>
//       </header>
//     </nav>
//   );
// }

// export default Navbar_Admin;
