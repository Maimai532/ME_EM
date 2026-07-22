# PROJECT_PROGRESS.md

## Mục tiêu
* Học web qua thực hành
* Hiểu logic thay vì copy code
* Build web nghe nhạc từng bước

## Công nghệ đang học
* HTML
* CSS
* JavaScript
* React 
* Node.js 
* Git + GitHub

## Trình độ hiện tại
* Biết HTML/CSS cơ bản
* Đang học JavaScript
* Chưa vững React/backend/database

## Đã làm
* Setup project structure
* Tạo client/server
* Setup Vite
* Thiết kế architecture
* Setup, commmit Git
* Setup Tailwind CSS
* Tạo layout cơ bản cho login, singup, Navbar
* Render có điều kiện (login, navbar)
* tạo song card, section; ui home,nav,sidebar cơ bản;

* Auth API, User API, crud user
* Admin crud song, playlist, quản lí user(chưa có new user)
* search, lọc song
* profile
* Migration cloudinary -> B2
* Frontend stream từ B2
* User đc tạo libary, likesong
* Gợi ý bài hát tìm kiếm = api grop


## Đang tập trung
* JavaScript cơ bản
* UI layout
* DOM manipulation
* Học Git workflow

## Cần học thêm
* DOM
* Array methods
* Async/Await
* React state
* API calls
* Authentication
* Database queries
* Git branch/commit workflow

## Git Workflow
* Commit sau mỗi task nhỏ
* Commit message rõ ràng
* Push code thường xuyên lên GitHub
* Không commit node_modules hoặc .env

## Nguyên tắc
* Giải thích trước khi code
* Chia nhỏ task
* Ưu tiên dễ hiểu
* Không overengineering




📋 Checklist: Bảo vệ bản quyền + Deploy an toàn
1. Xử lý nguồn nhạc (làm trước khi deploy)
 Thay nhạc tải từ YouTube bằng nhạc royalty-free/Creative Commons (Free Music Archive, ccMixter, Jamendo, Incompetech, Bensound, hoặc YouTube Audio Library — mục nhạc miễn phí bản quyền)
 Xóa toàn bộ file mp3 có bản quyền đang lưu trên B2/Cloudinary trước khi share công khai
 Seed lại database bằng bộ nhạc mới (giữ nguyên metadata structure hiện tại)
2. Deploy hạ tầng (giữ nguyên plan cũ)
 Frontend → Vercel
 Backend → Render
 Database → MongoDB Atlas
3. Thêm lớp chặn truy cập (chọn 1 hoặc kết hợp)

Cách A — Nhanh, không cần code:

 Vào Vercel Project Settings → bật Password Protection (lưu ý: cần gói Pro để bảo vệ production domain)

Cách B — Dùng đúng kiến trúc JWT sẵn có (khuyên dùng):

 Chặn route chính, bắt buộc đăng nhập mới xem/nghe được nhạc
 Tạo 1 tài khoản demo cố định (email/password) để gửi cho người cần xem (nhà tuyển dụng, reviewer)

Cách C — Basic Auth ở tầng server (nhanh, độc lập với JWT):

 Thêm middleware Basic Auth chặn toàn bộ site bằng 1 user/pass cố định (browser tự hiện popup nhập)
4. Bonus — an toàn thêm
 Thêm robots.txt disallow all để tránh Google index trang
 Cân nhắc quay 1 video demo ngắn (Loom/YouTube unlisted) để đưa vào CV, không cần ai phải login mới xem được