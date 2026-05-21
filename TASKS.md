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



## FE — Feature-based structure

client/src/
│
├── features/               
│
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── authService.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   │
│   │   └── components/
│   │       └── AuthForm.jsx
│   │
│   ├── home/
│   │   ├── components/
│   │   │   ├── SongCard.jsx
│   │   │   ├── SongSection.jsx
│   │   │
│   │   ├── services/
│   │   │   └── songService.js
│   │   │   └── sectionService.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useSections.js
│   │   │
│   │   └── pages/
│   │   |   └── Home.jsx
│   │   |   
│   │   └── styles/
│   │       └── Home.css
│   │       └── SongCard.css
│   │       └── SongSection.css
│   │
│   ├── player/
│   │   ├── components/
│   │   │   ├── Player.jsx
│   │   │   └── PlayerBar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── PlayerContext.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── MusicPlayer.css
│   │   │   └── PlayerBar.css
│   │   │
│   │   └── pages/
│   │       └── MusicPlayer.jsx
│   │
│   ├── playlist/
│   │   ├── components/
│   │   │   ├── PlaylistCard.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── Playlist.jsx
│   │   │
│   │   ├── services/
│   │
│   ├── library/
│   │   └── pages/
│   │       └── Library.jsx
│   │
│   ├── profile/
│   │   └── pages/
│   │       └── Profile.jsx
│   │
│   ├── search/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   │
│   └── admin/
│       ├── pages/
│       │   ├── Admin_Page.jsx
│       │   ├── Admin_Song.jsx
│       │   ├── Admin_Playlist.jsx
│       │   └── Admin_User.jsx
│       │
│       ├── services/
│       │   └── adminService.js
│       │
│       └── components/
│       │   └── AdminSidebar.jsx
│       │
│       └── styles/
│       │   ├── Admin_Page.css
│       │   ├── Admin_Song.css
│       │   ├── Admin_Playlist.css
│       │   └── Admin_User.css
│
│
├── shared/                                # Dùng chung toàn app
│
│   ├── components/
│   │   └── ui/
│   │   │    ├── Button.jsx
│   │   │    ├── Input.jsx
│   │   │    ├── index.jsx
│   │   │    ├── Navbar.jsx
│   │   │    ├── Sidebar.jsx
│   │   │    ├── Modal.jsx
│   │   │    └── Toast.jsx
│   │   │
│   │   └── song/
│   │   
│   │   
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── AdminLayout.jsx
│   │   └── MainLayout.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── hooks/
│   │   └── useToast.js
│   │
│   ├── utils/
│   │   └── formatTime.js
│   │
│   ├── constants/
│   │   └── api.js
│   │   └── constants.js
│   │   └── index.js
│   │
│   ├── styles/
│   │   ├── AdminLayout.css
│   │   └── MainLayout.css
│   │   └── Navbar.css
│   │   └── player.css
│   │   └── Sidebar.css
│   │   └── toast.css
│   │   └── variables.css
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── App.jsx
└── main.jsx


## BE — Feature-based structure


server/src/
│
├── features/
│
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   ├── auth.service.js
│   │   ├── auth.validator.js
│   │   └── auth.model.js
│   │
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   ├── user.service.js
│   │   ├── user.validator.js
│   │   └── user.model.js
│   │
│   ├── song/
│   │   ├── song.controller.js
│   │   ├── song.routes.js
│   │   ├── song.service.js
│   │   ├── song.validator.js
│   │   └── song.model.js
│   │
│   ├── playlist/
│   │   ├── playlist.controller.js
│   │   ├── playlist.routes.js
│   │   ├── playlist.service.js
│   │   └── playlist.model.js
│   │
│   ├── history/
│   │   ├── history.controller.js
│   │   ├── history.routes.js
│   │   ├── history.service.js
│   │   └── history.model.js
│   │
│   └── admin/
│       ├── admin.controller.js
│       ├── admin.routes.js
│       └── admin.service.js
│
├── shared/
│
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── services/
│   │   └── cloudinaryService.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── responseHandler.js
│   │   └── asyncHandler.js
│   │
│   ├── constants/
│   │   └── roles.js
│   │
│   └── uploads/
│
├── app.js
└── server.js

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


- Frontend React -> getSongById() -> Backend generate signed URL -> B2 private bucket -> audio stream


