🚇 Metro Ticket Management System

Hệ thống web full-stack cho phép quản lý vé tàu metro, hỗ trợ mua vé, kiểm tra vé và quản lý vận hành hệ thống.  
Ứng dụng được thiết kế với mục tiêu mang lại trải nghiệm **nhanh chóng – chính xác – realtime**.

---

📌 Tổng Quan Dự Án

Dự án mô phỏng hệ thống bán vé và kiểm soát vé metro trong thực tế, bao gồm các chức năng từ mua vé, xác thực vé đến quản lý hệ thống.

Hệ thống hỗ trợ đa vai trò:
- 👤 Passenger (Hành khách)
- 🧑‍💼 Staff (Nhân viên)
- 🕵️ Inspector (Thanh tra)
- 🛠 Admin (Quản trị)

---

💼 Vai Trò Phân Tích Nghiệp Vụ (Business Analyst - BA)

🔹 Phân tích & thiết kế luồng hệ thống
- Xây dựng hệ thống phân quyền đa vai trò
- Thiết kế luồng **mua vé → thanh toán → tạo QR code**
- Xây dựng quy trình **kiểm tra vé tại cổng (validate ticket)**

🔹 Quản lý vé & giao dịch
- Thiết kế logic xử lý trạng thái vé:
  - VALID / EXPIRED / DENIED
- Xây dựng hệ thống quản lý lịch sử giao dịch
- Thiết kế cơ chế nạp tiền tài khoản

🔹 Hệ thống kiểm tra & giám sát
- Đặc tả nghiệp vụ kiểm tra vé của Staff & Inspector
- Xây dựng luồng xử lý vi phạm (violation report)
- Thiết kế dashboard theo dõi hoạt động hệ thống

🔹 Realtime & hệ thống thông minh
- Đề xuất tích hợp **Socket.io** cho cập nhật realtime
- Thiết kế luồng notification & dashboard live

🔹 Tài liệu & đảm bảo chất lượng
- Viết User Stories & Acceptance Criteria
- Phối hợp Frontend & Backend đảm bảo đúng nghiệp vụ

---

🎨 Vai Trò Phát Triển Giao Diện (Frontend Developer)

🔹 Thiết kế UI/UX
- Xây dựng giao diện hiện đại, dễ sử dụng
- Responsive trên Desktop / Tablet / Mobile
- Tối ưu trải nghiệm người dùng (UX)

🔹 Phát triển dashboard
- Admin Dashboard: quản lý hệ thống & báo cáo
- Staff Interface: kiểm tra vé nhanh chóng
- Passenger UI: mua vé & xem lịch sử

🔹 Xử lý logic phía client
- Gọi API với Axios
- Quản lý route (React Router)
- Hiển thị trạng thái vé realtime

🔹 Realtime UI
- Hiển thị dữ liệu live với Socket.io
- Notification & cập nhật dashboard ngay lập tức

---

 🛠 Công Nghệ Sử Dụng

🎨 Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Socket.io Client

⚙️ Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.io

---

✨ Tính Năng Chính

- 🔐 Xác thực người dùng (JWT)
- 🎫 Mua vé & tạo QR code
- 💳 Nạp tiền & lịch sử giao dịch
- 🚧 Kiểm tra vé tại cổng (Staff)
- 🕵️ Kiểm tra vé thủ công (Inspector)
- 📊 Dashboard & báo cáo (Admin)
- ⚡ Cập nhật realtime
