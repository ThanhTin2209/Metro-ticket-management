# 🚇 Metro Ticket Management System

Hệ thống web full-stack cho phép quản lý vé tàu metro, hỗ trợ mua vé, kiểm tra vé và quản lý vận hành hệ thống.  
Ứng dụng được thiết kế nhằm mang lại trải nghiệm nhanh chóng, chính xác và realtime.

---

## 📌 1. Tổng Quan Dự Án

Dự án mô phỏng hệ thống bán vé và kiểm soát vé metro trong thực tế, bao gồm các chức năng từ mua vé, xác thực vé đến quản lý vận hành.

Hệ thống hỗ trợ đa vai trò:
- Passenger (Hành khách)  
- Staff (Nhân viên)  
- Inspector (Thanh tra)  
- Admin (Quản trị)  

---

## 💼 2. Vai Trò Phân Tích Nghiệp Vụ (Business Analyst)

### 2.1 Phân tích & thiết kế hệ thống
- Xây dựng hệ thống phân quyền đa vai trò  
- Thiết kế luồng mua vé → thanh toán → tạo QR code  
- Xây dựng quy trình kiểm tra vé tại cổng (validate ticket)  

---

### 2.2 Quản lý vé & giao dịch
- Thiết kế logic xử lý trạng thái vé:
  - VALID / EXPIRED / DENIED  
- Xây dựng hệ thống quản lý lịch sử giao dịch  
- Thiết kế cơ chế nạp tiền tài khoản  

---

### 2.3 Hệ thống kiểm tra & giám sát
- Đặc tả nghiệp vụ kiểm tra vé của Staff và Inspector  
- Xây dựng luồng xử lý vi phạm (violation report)  
- Thiết kế dashboard theo dõi hoạt động hệ thống  

---

### 2.4 Realtime & hệ thống thông minh
- Tích hợp Socket.io để cập nhật realtime  
- Thiết kế hệ thống notification và dashboard live  

---

### 2.5 Tài liệu & đảm bảo chất lượng
- Viết User Stories và Acceptance Criteria  
- Phối hợp Frontend và Backend để đảm bảo đúng nghiệp vụ  

---

## 🎨 3. Vai Trò Phát Triển Giao Diện (Frontend Developer)

### 3.1 Thiết kế UI/UX
- Giao diện hiện đại, dễ sử dụng  
- Responsive trên Desktop, Tablet và Mobile  
- Tối ưu trải nghiệm người dùng  

---

### 3.2 Phát triển dashboard
- Admin Dashboard: quản lý hệ thống và báo cáo  
- Staff Interface: kiểm tra vé nhanh chóng  
- Passenger UI: mua vé và xem lịch sử  

---

### 3.3 Xử lý logic phía client
- Gọi API bằng Axios  
- Quản lý route với React Router  
- Hiển thị trạng thái vé realtime  

---

### 3.4 Realtime UI
- Hiển thị dữ liệu realtime với Socket.io  
- Notification và cập nhật dashboard ngay lập tức  

---

## 🛠 4. Công Nghệ Sử Dụng

### Frontend
- React (Vite)  
- React Router  
- Tailwind CSS  
- Axios  
- Socket.io Client  

---

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Socket.io  

---

## ✨ 5. Tính Năng Chính

- Xác thực người dùng (JWT)  
- Mua vé và tạo QR code  
- Nạp tiền và quản lý giao dịch  
- Kiểm tra vé tại cổng (Staff)  
- Kiểm tra vé thủ công (Inspector)  
- Dashboard và báo cáo (Admin)  
- Cập nhật dữ liệu realtime  
