# Tổng Quan Dự Án

Tên project: ME_EM

Đây là một web nghe nhạc fullstack lấy cảm hứng từ Spotify và YouTube Music.

Mục tiêu:
* Xây dựng một nền tảng nghe nhạc hiện đại
* Có khả năng mở rộng tốt
* Kiến trúc rõ ràng, dễ maintain
* Phù hợp cho beginner nhưng vẫn theo hướng production-lite

Đọc file AI_CONTEXT.md trước rồi tiếp tục hỗ trợ project.

=================
CÔNG NGHỆ SỬ DỤNG
=================

Frontend:
* React + Vite
* Tailwind CSS
* React Router DOM
* Axios
* Lucide React

Backend:
* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Multer
* Cloudinary (upload audio/image)

Deploy:
* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

================
CẤU TRÚC PROJECT
================

ME_EM/
│
├── client/
├── server/
├── package.json
└── README.md

=================
CẤU TRÚC FRONTEND
=================

client/src/
│
├── assets/
├── components/
│   ├── ui/
│   ├── player/
│   ├── song/
│   ├── playlist/
│   └── layout/
│
├── pages/
├── layouts/
├── routes/
├── context/
├── services/
├── hooks/
├── utils/
├── styles/
├── constants/
│
├── App.jsx
└── main.jsx

================
CẤU TRÚC BACKEND
================

server/src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── uploads/
│
├── app.js
└── server.js

===============
CHỨC NĂNG CHÍNH
===============

USER:
* Đăng ký / Đăng nhập
* JWT Authentication
* Tìm kiếm nhạc / nghệ sĩ / album / thể loại
* Nghe nhạc
* Play / Pause
* Next / Previous
* Autoplay
* Repeat
* Queue nhạc
* Yêu thích bài hát
* Tạo playlist
* Lịch sử nghe
* Quản lý tài khoản
* Đổi avatar / tên / mật khẩu
* Xoá tài khoản

ADMIN:
* Thêm / sửa / xoá nhạc 
* Quản lý playlist
* Quản lý người dùng

=================
THIẾT KẾ DATABASE
=================

Collections:
* users
* songs
* playlists
* histories

Quan hệ chính:
* User likedSongs
* User playlists
* Playlist songs
* History liên kết User + Song

MongoDB CHỈ lưu:
* audioUrl
* imageUrl

File audio và image thực tế sẽ lưu trên Cloudinary.

============
QUY TẮC CODE
============

Frontend:
* Chỉ dùng Functional Components
* Dùng Context API thay Redux
* Component phải reusable
* Pages phải gọn
* Logic nên tách vào services/hooks

Backend:
* Theo mô hình MVC
* Routes -> Controllers -> Models
* Dùng async/await
* Có centralized error handling
* Dùng middleware cho auth/admin

==================================================
QUAN TRỌNG
==========

* KHÔNG lưu file audio trong MongoDB
* KHÔNG nhét toàn bộ code vào App.jsx
* KHÔNG tạo component quá lớn
* Code phải modular
* Ưu tiên beginner-friendly
* Ưu tiên scalability và maintainability

=================
THỨ TỰ PHÁT TRIỂN
=================

1. Setup project structure
2. React routing
3. Layout system
4. Authentication
5. Music player
6. Song APIs
7. Playlist system
8. Admin dashboard


HƯỚNG DẪN CHO AI
Khi hỗ trợ project này:
* Luôn follow architecture hiện tại
* Giữ code modular
* Không overengineering
* Ưu tiên giải pháp dễ hiểu
* Giữ folder structure scalable
* Giải thích rõ các phần quan trọng
* Generate code theo hướng production-lite

TRẠNG THÁI HIỆN TẠI
* Đã setup monorepo
* Đã tạo client/server
* Đã thiết kế architecture
* Đã thiết kế database