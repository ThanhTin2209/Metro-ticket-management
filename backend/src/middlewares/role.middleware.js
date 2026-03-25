const AppError = require("../utils/appError"); // Module tạo lỗi API tập trung

// Middleware kiểm tra quyền hạn (Role) của người dùng
function authorizeRoles(...roles) {
  // Trả về một hàm middleware chuẩn của Express
  return (req, res, next) => {
    // Nếu chưa đi qua middleware authenticate (không có đối tượng req.user)
    if (!req.user) {
      // Trả lỗi 401 (Chưa xác thực)
      return next(new AppError("Unauthorized", 401));
    }

    // Kiểm tra xem vai trò của user hiện tại có nằm trong danh sách các vai trò được phép (`...roles`)
    if (!roles.includes(req.user.role)) {
      // Nếu không có quyền, trả lỗi 403 (Bị cấm truy cập)
      return next(new AppError("Forbidden", 403));
    }

    // Nếu thỏa mãn quyền hạn, cho phép đi tiếp vào Controller
    return next();
  };
}

module.exports = {
  authorizeRoles, // Xuất hàm để cấu hình bảo vệ các route nhạy cảm
};
