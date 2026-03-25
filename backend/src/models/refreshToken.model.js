const mongoose = require("mongoose"); // Thư viện Mongoose dùng để quản lý schema và kết nối MongoDB

// Định nghĩa cấu trúc bản ghi lưu trữ Refresh Token trong Database
const refreshTokenSchema = new mongoose.Schema(
  {
    // Liên kết tới ID người dùng sở hữu token này
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu tới model User
      required: true,
      index: true, // Đánh chỉ mục để truy vấn nhanh khi kiểm tra phiên làm việc của user
    },
    // Chuỗi mã token (đã được ký bằng JWT)
    token: {
      type: String,
      required: true,
      unique: true, // Đảm bảo mỗi token là duy nhất, không bị trùng lặp
    },
    // Thời điểm token này hết hạn và không thể dùng để xin cấp lại access token nữa
    expiresAt: {
      type: Date,
      required: true,
    },
    // Trạng thái thu hồi: dùng để vô hiệu hóa token khi user đăng xuất hoặc đổi mật khẩu
    isRevoked: {
      type: Boolean,
      default: false, // Mặc định ban đầu là đang hoạt động (chưa bị thu hồi)
    },
    // Thông tin thiết bị (User-Agent)
    userAgent: {
      type: String,
    },
    // Địa chỉ IP của phiên
    ip: {
      type: String,
    },
  },
  {
    // Tự động tạoCreatedAt và UpdatedAt
    timestamps: true,
    // Chỉ định rõ tên collection trong MongoDB là 'refresh_tokens'
    collection: "refresh_tokens",
  }
);

// Tạo và xuất Model RefreshToken từ Schema đã định nghĩa
module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
