// Xử lý các yêu cầu tới các đường dẫn (Router) không tồn tại trong hệ thống
function notFoundHandler(req, res) {
  // Trả về mã lỗi 404 cho Client
  return res.status(404).json({
    success: false, // Trạng thái thất bại
    message: "Not Found", // Thông báo không tìm thấy tài nguyên
  });
}

// Middleware tập trung để xử lý tất cả các lỗi phát sinh trong ứng dụng
function errorHandler(err, req, res, next) {
  // Lấy mã lỗi từ đối tượng lỗi, mặc định là 500 (Lỗi server nội bộ)
  const statusCode = err.statusCode || 500;
  // Kiểm tra xem ứng dụng đang chạy ở môi trường Production (Sản xuất) hay không
  const isProd = process.env.NODE_ENV === "production";

  // Trả về phản hồi lỗi chuẩn hóa cho Client
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error", // Thông báo lỗi thân thiện
    // Nếu không phải Production, trả về thêm 'stack' (vết lỗi) để lập trình viên dễ fix
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler, // Export hàm xử lý 404
  errorHandler, // Export hàm xử lý lỗi tổng
};
