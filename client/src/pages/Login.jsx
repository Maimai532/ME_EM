import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { Link,useNavigate } from "react-router-dom";
import { useState } from 'react'


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
    marginBottom: "1.5rem"
  }
};

function Login() {

  // PHẦN 1: STATE — lưu dữ liệu người dùng nhập
  // useState như "ô nhớ" — React dùng nó để theo dõi
  // dữ liệu thay đổi theo thời gian thực

  const [email, setEmail] = useState('')
  //     ↑ đọc    ↑ ghi      ↑ giá trị ban đầu
  const [password, setPassword] = useState('')

  // PHẦN 2: HANDLER — xử lý khi bấm nút Login

  const navigate = useNavigate();
  const handleSubmit = (e) => {

    navigate("/Home");
    e.preventDefault()  // ← ngăn trình duyệt reload trang (quan trọng!)

    // Lúc này email và password đã có giá trị người dùng nhập
    console.log(email, password)

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
        <h1 className="text-white text-2xl font-bold text-center mb-6" style={styles.Title}>
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

          <Button type="submit" onClick={handleSubmit}>
            Đăng nhập
          </Button>


          <Link
            to="/Register"
            className="text-sm text-blue-400 hover:underline text-center"
          >
            Chưa có tài khoản? Đăng ký
          </Link>


        </form>
      </div>
    </div>
  );
}

export default Login //Cho phép file khác import file