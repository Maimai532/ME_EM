## Sau mỗi task
git add .
git commit -m " "


# Login

client/src/
├── pages/
│   └── LoginPage.jsx        ← trang login chính
├── components/
│   └── ui/
│       └── InputField.jsx   ← ô input tái sử dụng
├── services/
│   └── authService.js       ← gọi API login
└── context/
    └── AuthContext.jsx      ← lưu trạng thái đăng nhập

Flow: index.html -> main.jsx -> App.jsx -> AppRoutes -> Pages

