const mongoose = require("mongoose"); // Thư viện ODM dùng cho MongoDB

// Định nghĩa cấu trúc bản ghi cho người dùng trong hệ thống
const userSchema = new mongoose.Schema(
  {
    // Địa chỉ email độc nhất, dùng để đăng nhập
    email: {
      type: String,
      required: true,
      unique: true, // Đảm bảo không có 2 người trùng email
      lowercase: true, // Tự động chuyển về chữ thường để tránh nhầm lẫn
      trim: true, // Xóa khoảng trắng thừa 2 đầu
    },
    // Mật khẩu đã được băm bằng bcrypt trước khi lưu vào DB
    password: {
      type: String,
      required: true,
    },
    // Họ và tên hiển thị của người dùng
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Phân quyền (RBAC): Quyết định quyền hạn của người dùng trong hệ thống
    role: {
      type: String,
      enum: ["passenger", "staff", "inspector", "admin"], // Các vai trò hợp lệ
      default: "passenger", // Mặc định khi mới đăng ký là hành khách
    },
    // Trạng thái tài khoản: Dùng để khóa/mở khóa tài khoản thay vì xóa vĩnh viễn
    isActive: {
      type: Boolean,
      default: true, // Mặc định là đang hoạt động
    },
    // Số dư tài khoản để mua vé
    balance: {
      type: Number,
      default: 0,
    },
    // Ảnh đại diện (URL hoặc base64)
    avatar: {
      type: String,
    },
    // Token khôi phục mật khẩu
    resetPasswordToken: {
      type: String,
    },
    // Thời gian hết hạn của token khôi phục mật khẩu
    resetPasswordExpires: {
      type: Date,
    },
    // Mã bí mật 2FA
    twoFactorSecret: {
      type: String,
    },
    // Trạng thái bật/tắt 2FA
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Tự động quản lý hai trường createdAt (ngày tạo) và updatedAt (ngày sửa cuối)
    timestamps: true,
  }
);

// Tạo và xuất Model 'User' từ Schema vừa định nghĩa
module.exports = mongoose.model("User", userSchema);
