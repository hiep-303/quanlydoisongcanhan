# LifeHub - Nền Tảng Quản Lý Đời Sống Cá Nhân Toàn Diện

> **Đề tài:** Nghiên cứu và xây dựng hệ thống quản lý đời sống cá nhân trên nền tảng web  
> **Phiên bản:** 1.0.0 (Hoàn chỉnh Frontend + Backend + Database + AI Assistant + Admin)

---

## 1. Giới thiệu tổng quan

**LifeHub** là một hệ thống web đa trang, đa phân hệ giúp người dùng quản lý tập trung và khoa học toàn bộ các hoạt động thường ngày, bao gồm:
1. **Quản lý công việc (Tasks):** Hỗ trợ chuyển đổi giữa chế độ Danh sách (List) và Bảng trực quan (Kanban), lọc theo mức ưu tiên, hạn hoàn thành, danh mục và tìm kiếm từ khóa.
2. **Lịch trình & Sự kiện (Calendar):** Chế độ xem Tháng, Tuần, Ngày; quản lý sự kiện và thuật toán kiểm tra ràng buộc thời gian bắt đầu < kết thúc.
3. **Mục tiêu dài hạn (Goals):** Thiết lập mục tiêu SMART, phân rã thành các bước hành động (Milestones) với thanh tiến trình % và tính năng **AI gợi ý lộ trình tự động**.
4. **Rèn luyện thói quen (Habits):** Điểm danh hằng ngày, tự động tính chuỗi ngày liên tục (streak) và kỷ lục chuỗi (best streak), ma trận theo dõi 7 ngày gần nhất.
5. **Quản lý tài chính cá nhân (Finance):** Ghi chép thu chi chi tiết, thiết lập hạn mức ngân sách theo từng danh mục, tự động cảnh báo khi gần đạt hoặc vượt ngân sách (>80%, >100%).
6. **Ghi chú cá nhân (Notes):** Ghi chép an toàn, ghim ghi chú quan trọng, phân loại theo thẻ (tags) và tìm kiếm nội dung.
7. **Trung tâm thông báo (Notifications):** Thông báo trong ứng dụng cho công việc đến hạn, sự kiện sắp diễn ra, cảnh báo ngân sách và thói quen.
8. **Báo cáo & Thống kê (Reports):** Tổng hợp số liệu thực tế từ cơ sở dữ liệu, phân tích cơ cấu chi tiêu, so sánh qua các kỳ và xuất dữ liệu báo cáo ra tệp **CSV**.
9. **Trợ lý AI Đời sống (AI Assistant):** Tích hợp phân tích dữ liệu thực của người dùng (nhiệm vụ ưu tiên, tình hình chi tiêu, thói quen), gợi ý kế hoạch ngày, cho phép xóa lịch sử và hỗ trợ cắm API ngoài (Google Gemini API).
10. **Hồ sơ & Bảo mật cá nhân (Profile & Settings):** Cập nhật hồ sơ, đổi mật khẩu an toàn, đổi giao diện Sáng / Tối (Dark mode), xuất toàn bộ dữ liệu người dùng (JSON) và xóa tài khoản vĩnh viễn.
11. **Phân hệ Quản trị (Admin Portal):** Dashboard quản trị giám sát hệ thống, quản lý tài khoản người dùng, khóa / mở khóa tài khoản, phân quyền (User / Admin) và lưu vết nhật ký kiểm toán (Audit Logs).

---

## 2. Công nghệ sử dụng

| Tầng | Công nghệ / Thư viện | Vai trò |
|---|---|---|
| **Frontend** | React 18, Vite 6, React Router DOM 6 | Xây dựng Single Page Application hiện đại, tốc độ cao |
| **Giao diện & Biểu tượng** | Vanilla CSS Design System, Lucide React | Thiết kế chuẩn mực, Glassmorphism, Responsive, Dark/Light Mode |
| **Backend** | Node.js (v23+), Express.js | REST API chuẩn, phân tách Controller - Service - Middleware |
| **Cơ sở dữ liệu** | SQLite (`node:sqlite`) | ACID SQL Database, lưu trữ tệp tin thực tế tại `server/data/app.db` |
| **Bảo mật** | Bcryptjs, JSON Web Token (JWT) | Băm mật khẩu một chiều, xác thực Bearer token, phân quyền RBAC |
| **AI Assistant** | LifeHub Contextual AI Engine / Google Gemini API | Phân tích số liệu thực tế và đưa ra lời khuyên cá nhân hóa |

---

## 3. Cấu trúc thư mục dự án

```text
c:\quanlydoisongcanhan\
├── client/                     # Mã nguồn Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/         # Sidebar, Header, AppLayout
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── landing/        # LandingPage (Trang giới thiệu)
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── dashboard/      # Dashboard tổng quan
│   │   │   ├── tasks/          # Công việc (List & Kanban)
│   │   │   ├── calendar/       # Lịch trình & Sự kiện
│   │   │   ├── goals/          # Mục tiêu & Milestones
│   │   │   ├── habits/         # Thói quen & Streaks
│   │   │   ├── finance/        # Tài chính & Ngân sách
│   │   │   ├── notes/          # Ghi chú & Tags
│   │   │   ├── notifications/  # Trung tâm thông báo
│   │   │   ├── reports/        # Báo cáo & Xuất CSV
│   │   │   ├── assistant/      # Trợ lý AI Assistant
│   │   │   ├── profile/        # Hồ sơ & Xuất dữ liệu JSON
│   │   │   ├── settings/       # Cài đặt giao diện & thông báo
│   │   │   ├── help/           # Trợ giúp, FAQ & Phản hồi
│   │   │   ├── admin/          # Admin Dashboard & Quản lý người dùng
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/           # api.js (Fetch wrapper)
│   │   ├── App.jsx             # React Router 20 routes
│   │   ├── index.css           # LifeHub Design System tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Mã nguồn Backend (Node.js + Express)
│   ├── data/
│   │   └── app.db              # Tệp cơ sở dữ liệu SQLite
│   ├── src/
│   │   ├── config/             # db.js (Schema SQLite), jwt.js
│   │   ├── controllers/        # auth, user, task, event, goal, habit, finance, note, notif, report, ai, admin, feedback
│   │   ├── middleware/         # auth.js (requireAuth, requireAdmin)
│   │   ├── routes/             # authRoutes, taskRoutes, adminRoutes, v.v.
│   │   ├── services/           # seedService.js, aiService.js
│   │   └── app.js              # Express app & route mounting
│   ├── package.json
│   └── server.js               # Entry point máy chủ
├── .env.example                # Mẫu biến môi trường
├── .gitignore
├── AI_Agent_Quan_Ly_Doi_Song_Ca_Nhan.md # Tài liệu yêu cầu gốc
└── README.md
```

---

## 4. Hướng dẫn cài đặt và khởi chạy

### 4.1. Yêu cầu môi trường
- **Node.js**: Phiên bản 22 hoặc 23 trở lên (khuyên dùng v23.3.0 có sẵn `node:sqlite`).
- **NPM**: v10+.

### 4.2. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục gốc dự án:

```powershell
# 1. Cài đặt cho Backend
cd server
npm install

# 2. Cài đặt cho Frontend
cd ../client
npm install
```

### 4.3. Khởi chạy máy chủ Backend
```powershell
cd server
npm start
```
- Máy chủ sẽ tự động tạo cơ sở dữ liệu SQLite `server/data/app.db` và nạp dữ liệu mẫu ban đầu.
- Backend API chạy tại: **`http://localhost:5000`**
- Kiểm tra sức khỏe dịch vụ: `http://localhost:5000/health`

### 4.4. Khởi chạy máy chủ Frontend
Mở một cửa sổ terminal mới:
```powershell
cd client
npm run dev
```
- Ứng dụng web chạy tại: **`http://localhost:5173`**
- Vite proxy tự động chuyển tiếp các yêu cầu `/api` sang backend cổng 5000.

---

## 5. Tài khoản dùng thử (Demo Accounts)

Hệ thống đã nạp sẵn dữ liệu thực tế và tài khoản thử nghiệm:

| Tài khoản | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Người dùng mẫu (Demo User)** | `user@lifehub.vn` | `User@123` | Quản lý toàn bộ đời sống cá nhân (công việc, thói quen, ngân sách...) |
| **Quản trị viên (Admin)** | `admin@lifehub.vn` | `Admin@123` | Quản trị hệ thống, khóa/mở khóa tài khoản, phân quyền, xem audit log |

*(Trang đăng nhập cũng tích hợp 2 nút bấm nhanh **"Demo User"** và **"Admin"** để thuận tiện kiểm thử một chạm).*

---

## 6. Danh mục 20 trang giao diện bắt buộc

1. **Trang giới thiệu** (`/`)
2. **Đăng nhập** (`/login`)
3. **Đăng ký** (`/register`)
4. **Quên mật khẩu** (`/forgot-password`)
5. **Dashboard tổng quan** (`/dashboard`)
6. **Công việc** (`/tasks`) - Xem Danh sách & Kanban
7. **Lịch trình** (`/calendar`) - Xem Tháng, Tuần, Ngày
8. **Mục tiêu** (`/goals`) - Quản lý mục tiêu & các bước SMART
9. **Thói quen** (`/habits`) - Điểm danh thói quen & tính streak
10. **Tài chính** (`/finance`) - Quản lý thu chi & hạn mức ngân sách
11. **Ghi chú** (`/notes`) - Ghi chú cá nhân & gắn thẻ
12. **Thông báo** (`/notifications`) - Trung tâm thông báo hệ thống
13. **Báo cáo & Thống kê** (`/reports`) - Xuất file CSV
14. **Trợ lý AI** (`/assistant`) - Trò chuyện và phân tích đời sống
15. **Hồ sơ cá nhân** (`/profile`) - Cập nhật thông tin & xuất JSON
16. **Cài đặt** (`/settings`) - Giao diện sáng/tối & ngôn ngữ
17. **Trợ giúp & FAQ** (`/help`) - Hướng dẫn & biểu mẫu phản hồi
18. **Dashboard quản trị** (`/admin`) - Dành riêng cho Admin
19. **Quản lý tài khoản** (`/admin/users`) - Dành riêng cho Admin
20. **Trang 404** (`*`) - Trang thông báo lỗi đường dẫn

---

## 7. Danh sách API Backend chính (`/api`)

- **Xác thực:**
  - `POST /api/auth/register`: Đăng ký tài khoản
  - `POST /api/auth/login`: Đăng nhập, nhận JWT token
  - `GET /api/auth/me`: Lấy thông tin tài khoản đang đăng nhập
  - `POST /api/auth/reset-password`: Đặt lại mật khẩu
- **Hồ sơ cá nhân:**
  - `GET /api/users/profile`, `PATCH /api/users/profile`
  - `POST /api/users/change-password`
  - `GET /api/users/export`: Xuất dữ liệu JSON
  - `DELETE /api/users/account`: Xóa tài khoản vĩnh viễn
- **Công việc (Tasks):**
  - `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `PATCH /api/tasks/:id/toggle`, `DELETE /api/tasks/:id`
  - `GET /api/tasks/stats`: Thống kê việc cần làm, quá hạn, đã xong
- **Lịch trình (Events):**
  - `GET /api/events`, `POST /api/events`, `PATCH /api/events/:id`, `DELETE /api/events/:id`
- **Mục tiêu (Goals):**
  - `GET /api/goals`, `POST /api/goals`, `PATCH /api/goals/:id`, `DELETE /api/goals/:id`
  - `PATCH /api/goals/:id/milestones/:mId`: Cập nhật hoàn thành từng mốc
  - `POST /api/goals/suggest-milestones`: AI gợi ý bước thực hiện
- **Thói quen (Habits):**
  - `GET /api/habits`, `POST /api/habits`, `PATCH /api/habits/:id`, `DELETE /api/habits/:id`
  - `POST /api/habits/:id/toggle-log`: Điểm danh và tự động tính streak
- **Tài chính & Ngân sách (Finance):**
  - `GET/POST/PATCH/DELETE /api/finance/transactions`
  - `GET/POST/DELETE /api/finance/budgets`
  - `GET /api/finance/analytics`
- **Ghi chú (Notes):**
  - `GET/POST/PATCH/DELETE /api/notes`
  - `PATCH /api/notes/:id/pin`: Ghim / bỏ ghim ghi chú
- **Thông báo (Notifications):**
  - `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- **Báo cáo (Reports):**
  - `GET /api/reports/summary`: Báo cáo từ dữ liệu thực
  - `GET /api/reports/export-csv?type=tasks|habits|transactions`: Xuất báo cáo CSV
- **Trợ lý AI (Assistant):**
  - `POST /api/assistant/chat`: Trò chuyện với AI
  - `GET/DELETE /api/assistant/history`: Quản lý lịch sử hội thoại
- **Quản trị viên (Admin - Kiểm tra `requireAdmin`):**
  - `GET /api/admin/overview`: Số liệu tổng quan
  - `GET /api/admin/users`: Danh sách thành viên, lọc và tìm kiếm
  - `PATCH /api/admin/users/:id/lock`: Khóa / mở khóa tài khoản
  - `PATCH /api/admin/users/:id/role`: Nâng quyền Admin / hạ quyền User
  - `GET /api/admin/audit-logs`: Nhật ký kiểm toán bảo mật

---

## 8. Trạng thái kiểm thử nghiệm thu (Checklist)

- [x] Có đầy đủ mã nguồn frontend và backend theo cấu trúc chuẩn.
- [x] Cơ sở dữ liệu SQLite thật (`app.db`), bảng quan hệ, indexes và foreign keys.
- [x] Đăng ký, đăng nhập và đăng xuất hoạt động thực tế.
- [x] Đầy đủ 20 route và điều hướng trang hoạt động trơn tru.
- [x] CRUD công việc, chuyển đổi List/Kanban, thống kê quá hạn.
- [x] Lịch trình theo tháng/tuần/ngày, kiểm tra logic `start_time < end_time`.
- [x] Mục tiêu với milestones, tính % tiến độ, AI gợi ý bước.
- [x] Thói quen tính streak liên tiếp, ma trận 7 ngày.
- [x] Tài chính thu/chi, hạn mức ngân sách, tự động cảnh báo khi vượt 80% hoặc 100%.
- [x] Ghi chú riêng tư, ghim lên đầu, gắn nhãn (tags).
- [x] Thông báo trong ứng dụng, đánh dấu đã đọc.
- [x] Báo cáo thống kê từ dữ liệu thực, xuất file CSV.
- [x] Trợ lý AI Assistant trả lời dựa trên dữ liệu thật, có thể cắm Gemini API.
- [x] Phân quyền Admin ở Backend (`requireAdmin`), khóa/mở khóa tài khoản kèm Audit Log.
- [x] Toàn bộ quy trình kiểm thử tự động trên trình duyệt thật (E2E Test) đã vượt qua thành công 10/10 bước.
