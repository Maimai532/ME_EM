## Sau mỗi task
git add .
git commit -m " "

## Luồng lm vc
main.jsx → App.jsx → AuthProvider → AppRoutes
                   → PlayerProvider
                                  → Layout (AuthLayout / AdminLayout)
                                           → Page (Home, Admin...)
                                                    → Component (SongCard...)
                                                               → services (gọi API)
                                                                          → Backend

## FE
client/src/
│
├── assets/                    # File tĩnh: ảnh, icon, font
│
├── components/                # UI nhỏ, tái sử dụng nhiều nơi
│   ├── ui/                    # Component cơ bản
│   │   ├── Input.jsx          # Ô nhập liệu
│   │   ├── Button.jsx         # Nút bấm
│   │   ├── Navbar.jsx         # Thanh điều hướng trên
│   │   └── Sidebar.jsx        # Thanh bên trái
│   │
│   └── song/                  # Component liên quan đến bài hát
│       ├── SongCard.jsx       # 1 ô bài hát (ảnh + tên + nghệ sĩ)
│       ├── SongSection.jsx    # 1 hàng nhiều SongCard (trending, mới...)
│       └── SongPlayer.jsx     # Thanh player dưới cùng
│
├── pages/                     # Trang — mỗi route 1 file
│   ├── Login.jsx              # Trang đăng nhập
│   ├── Register.jsx           # Trang đăng ký
│   ├── Home.jsx               # Trang chủ
│   ├── Library.jsx            # Thư viện / Yêu thích / Lịch sử
│   ├── Playlist.jsx           # Chi tiết playlist
│   ├── Profile.jsx            # Trang cá nhân / Settings
│   ├── Admin.jsx              # Dashboard admin
│   ├── Admin_Page.jsx         # Layout chung các trang admin
│   ├── Admin_Song.jsx         # Quản lý bài hát
│   ├── Admin_Playlist.jsx     # Quản lý playlist
│   ├── Admin_User.jsx         # Quản lý người dùng
│   └── MusicPlayer.jsx        # Trình phát nhạc theo id
│
├── layouts/                   # Layout bọc ngoài các page
│   ├── AuthLayout.jsx         # Layout chung cho user (Navbar + Sidebar)
│   └── AdminLayout.jsx        # Layout riêng cho admin (sidebar admin)
│   └── AuthLayout.jsx         # Layout auth
│
├── routes/                    # Cấu hình điều hướng
│   ├── AppRoutes.jsx          # Khai báo toàn bộ routes
│   └── ProtectedRoute.jsx     # RequireAuth, RequireAdmin
│
├── context/                   # State dùng chung toàn app (thay Redux)
│   ├── AuthContext.jsx        # user, token, login, logout, register
│   └── PlayerContext.jsx      # bài đang phát, queue, play/pause...
│
├── services/                  # Gọi API — tách logic ra khỏi component
│   ├── authService.js         # gọi /api/auth
│   ├── songService.js         # gọi /api/songs
│   ├── playlistService.js     # gọi /api/playlists
│   └── userService.js         # gọi /api/users
│
├── hooks/                     # Custom hooks tái sử dụng logic
│   ├── usePlayer.js           # hook điều khiển player
│   └── useDebounce.js         # hook delay search khi gõ
│
├── utils/                     # Hàm tiện ích nhỏ
│   └── formatTime.js          # chuyển giây → 3:45
│
├── styles/                    # CSS global hoặc biến màu
│   └── variables.css          # màu, font dùng chung
│
├── constants/                 # Hằng số dùng chung
│   └── api.js                 # BASE_URL = "http://localhost:8080/api"
│
├── App.jsx                    # Component gốc, bọc Provider
└── main.jsx                   # Entry point, render App vào DOM

## BE
server/src/
│
├── config/
│   └── db.js                  # Kết nối MongoDB
│
├── controllers/               # Xử lý logic chính của từng feature
│   ├── authController.js      # register, login
│   ├── userController.js      # getAllUsers, deleteUser, updateRole
│   ├── songController.js      # thêm/sửa/xoá/lấy bài hát
│   ├── playlistController.js  # CRUD playlist
│   └── historyController.js   # lưu/lấy lịch sử nghe
│
├── middleware/                # Chạy giữa request và controller
│   └── authMiddleware.js      # protect (check JWT), adminOnly (check role)
│
├── models/                    # Schema MongoDB — định nghĩa cấu trúc dữ liệu
│   ├── User.js                # username, email, password, role, likedSongs...
│   ├── Song.js                # title, artist, audioUrl, imageUrl, plays...
│   ├── Playlist.js            # name, owner, songs[], isPublic...
│   └── History.js             # user, song, playedAt
│
├── routes/                    # Khai báo URL và method (GET/POST/...)
│   ├── authRoutes.js          # /api/auth/register, /api/auth/login
│   ├── userRoutes.js          # /api/users
│   ├── songRoutes.js          # /api/songs
│   ├── playlistRoutes.js      # /api/playlists
│   └── historyRoutes.js       # /api/history
│
├── services/                  # Logic phức tạp tách ra khỏi controller
│   └── cloudinaryService.js   # upload audio/ảnh lên Cloudinary
│
├── utils/                     # Hàm tiện ích dùng chung
│   └── generateToken.js       # tạo JWT token
│
├── validators/                # Kiểm tra dữ liệu đầu vào
│   ├── authValidator.js       # validate email, password khi register/login
│   └── songValidator.js       # validate title, artist khi thêm bài hát
│
├── uploads/                   # Thư mục lưu file tạm khi upload (Multer)
│                              # File sẽ được đẩy lên Cloudinary rồi xoá
│
├── app.js                     # Setup Express: middleware, routes, CORS
└── server.js                  # Khởi động server, kết nối DB





## Note
- inline style ưu tiên cao hơn Tailwind
- JWT (JSON Web Token):"chìa khoá" để xác thực login
Đăng nhập → server trả token
Gọi API   → gửi kèm "Authorization: Bearer <token>"
Server     → kiểm tra token → cho phép hoặc từ chối
- Middleware:        Request → [Middleware 1] → [Middleware 2] → Controller → Response
                  (check token) (check role)        (xử lý)


- MVC (Model - View - Controller): tổ chức code backend: 
        Luồng: Route → Controller → Model → Database




