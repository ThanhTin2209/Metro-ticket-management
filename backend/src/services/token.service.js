const jwt = require("jsonwebtoken"); // Import thư viện jsonwebtoken để tạo mã JWT xác thực
const crypto = require("crypto"); // Import module crypto để tạo chuỗi ngẫu nhiên bảo mật

// Định nghĩa hàm kiểm tra và lấy biến môi trường, đảm bảo code lỗi ngay nếu thiếu cấu hình quan trọng
function requiredEnv(name) {
  const value = process.env[name]; // Lấy giá trị biến môi trường từ tiến trình ứng dụng
  if (!value) {
    // Nếu biến không tồn tại hoặc rỗng
    throw new Error(`${name} is required`); // Quăng lỗi dừng chương trình với thông báo biến bị thiếu
  }
  return value; // Trả về giá trị biến môi trường hợp lệ
}

// Hàm tạo mã Access Token phục vụ việc xác thực quyền truy cập ngắn hạn
function generateAccessToken(payload) {
  // Ký một token mới chứa payload (thông tin user) sử dụng bí mật (secret key)
  return jwt.sign(payload, requiredEnv("ACCESS_TOKEN_SECRET"), {
    // Thiết lập thời gian hết hạn của token từ biến môi trường hoặc mặc định 15 phút
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  });
}

// Hàm tạo mã Refresh Token phục vụ việc cấp mới Access Token khi nó hết hạn
function generateRefreshToken(payload) {
  // Ký một token dài hạn sử dụng một secret key riêng biệt cho Refresh Token
  return jwt.sign(payload, requiredEnv("REFRESH_TOKEN_SECRET"), {
    // Thiết lập thời gian sống dài (mặc định 7 ngày) để duy trì đăng nhập
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
    // Tạo một ID duy nhất cho token này để có thể quản lý việc thu hồi (revoke) sau này
    jwtid: crypto.randomUUID(),
  });
}

// Hàm giải mã và kiểm tra tính hợp lệ của mã Access Token được gửi từ Client
function verifyAccessToken(token) {
  // Kiểm tra chữ ký và thời hạn của token so với secret key
  return jwt.verify(token, requiredEnv("ACCESS_TOKEN_SECRET"));
}

// Hàm giải mã và kiểm tra tính hợp lệ của mã Refresh Token
function verifyRefreshToken(token) {
  // Kiểm tra Refresh Token dựa trên secret key tương ứng
  return jwt.verify(token, requiredEnv("REFRESH_TOKEN_SECRET"));
}

// Xuất bản các hàm xử lý token để các Controller và Middleware khác sử dụng
module.exports = {
  generateAccessToken, // Hàm tạo access token
  generateRefreshToken, // Hàm tạo refresh token
  verifyAccessToken, // Hàm xác thực access token
  verifyRefreshToken, // Hàm xác thực refresh token
};
