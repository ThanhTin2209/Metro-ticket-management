const User = require("../models/user.model"); // Import model User để truy vấn thông tin người dùng từ database
const { verifyAccessToken } = require("../services/token.service"); // Import hàm xác thực Token từ service
const AppError = require("../utils/appError"); // Import class xử lý lỗi tùy chỉnh

// Middleware để xác thực người dùng qua Access Token (JWT)
async function authenticate(req, res, next) {
  try {
    // Lấy chuỗi Authorization từ tiêu đề HTTP request (thường có dạng "Bearer <token>")
    const authHeader = req.headers.authorization || "";
    // Chia tách chuỗi để lấy phần loại token (scheme) và chuỗi token thực tế
    const [scheme, token] = authHeader.split(" ");

    // Kiểm tra định dạng có đúng là 'Bearer' và có tồn tại token hay không
    if (scheme !== "Bearer" || !token) {
      // Nếu không đúng định dạng, trả lỗi 401 (Chưa xác thực)
      return next(new AppError("Unauthorized", 401));
    }

    // Giải mã và xác thực token bằng Secret Key
    const payload = verifyAccessToken(token);
    // Tìm kiếm người dùng trong Database dựa trên ID (sub) trích xuất từ token
    // select("-password"): Loại bỏ trường mật khẩu để đảm bảo an toàn dữ liệu
    const user = await User.findById(payload.sub).select("-password");
    
    // Nếu không tìm thấy người dùng hoặc tài khoản đang bị khóa (isActive = false)
    if (!user || !user.isActive) {
      return next(new AppError("Unauthorized", 401));
    }

    // Gán thông tin người dùng vào đối tượng request để các Controller sau này sử dụng
    req.user = user;
    // Chuyển sang middleware hoặc controller tiếp theo
    return next();
  } catch (error) {
    // Nếu token hết hạn, bị sai chữ ký hoặc bất kỳ lỗi nào khác, trả về lỗi 401
    return next(new AppError("Unauthorized", 401));
  }
}

module.exports = {
  protect: authenticate,
  authenticate, // Xuất middleware để sử dụng trong các Routes
};
