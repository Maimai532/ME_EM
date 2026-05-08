import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const styles = {
  box: {
    padding: "20px",
    backgroundColor: "#1f2937",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #4e4e95",
  },
  Title: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
};

function Login() {
  //title page
  useEffect(() => {
    document.title = "Login";
  }, []);

  // PHẦN 1: STATE — lưu dữ liệu người dùng nhập
  // useState như "ô nhớ" — React dùng nó để theo dõi
  // dữ liệu thay đổi theo thời gian thực

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault(); // ← ngăn trình duyệt reload trang (quan trọng!)
    console.log(email, password); //email, password có gtri đc nhập

    login(); // ← cập nhật isLoggedIn = true
    navigate("/home");

    // Sau này sẽ gọi API ở đây
  };

  // PHẦN 3: JSX — giao diện hiển thị ra màn hình
  return (
    // Tailwind: min-h-screen = cao 100vh(min 100% screen), flex + items/justify-center = căn giữa
    // className trong React = class trong HTML. 1 class = 1 thuộc tính CSS.
    // Flexbox — cho phép sắp xếp các phần tử con theo hàng/cột dễ dàng.
    // Phải có flex thì items-center và justify-center mới có tác dụng.

    <div className="min-h-screen bg-black flex items-center justify-center">
      <div style={styles.box}>
        {/* Tiêu đề */}
        <h1
          className="text-white text-2xl font-bold text-center mb-6"
          style={styles.Title}
        >
          Đăng nhập
        </h1>

        {/* Form — onSubmit gọi handler khi bấm nút */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input email — onChange cập nhật state mỗi lần gõ */}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            //         ↑                    ↑
            //  event object         giá trị ô input
          />

          <Input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit">Đăng nhập</Button>

          <Link
            to="/register"
            className="text-sm text-blue-400 hover:underline text-center"
          >
            Đăng Ký
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login; //Cho phép file khác import file
