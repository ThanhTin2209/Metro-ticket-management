const AppError = require("../utils/appError"); // Class chuẩn hóa thông báo lỗi

// Sử dụng Map để lưu trữ thông tin lượt truy cập của các IP trong bộ nhớ RAM
const bucketStore = new Map();

// Hàm khởi tạo Middleware giới hạn tần suất truy cập cho các API
function createRateLimit({ windowMs = 60_000, limit = 20, keyGenerator } = {}) {
  return (req, res, next) => {
    // Xác định Key định danh (mặc định là kết hợp IP, Method và Đường dẫn API)
    const key =
      keyGenerator?.(req) ||
      `${req.ip || "unknown"}:${req.method}:${req.baseUrl}${req.path}`;

    const now = Date.now(); // Lấy thời điểm hiện tại
    const bucket = bucketStore.get(key); // Lấy thông tin lượt truy cập đã lưu của Key này

    // Nếu chưa có thông tin hoặc đã vượt qua cửa sổ thời gian (windowMs) giới hạn
    if (!bucket || now >= bucket.resetAt) {
      // Khởi tạo/Reset lại bộ đếm cho Key
      bucketStore.set(key, {
        count: 1, // Bắt đầu ở lần 1
        resetAt: now + windowMs, // Thời điểm sẽ được reset lượt truy cập
      });
      return next(); // Cho phép truy cập tiếp
    }

    // Nếu vẫn trong khoảng thời gian giới hạn, tăng biến đếm lên 1
    bucket.count += 1;
    // Nếu vượt quá số lần cho phép (limit)
    if (bucket.count > limit) {
      // Trả lỗi 429 và thông báo thời gian chờ còn lại
      return next(
        new AppError(
          `Too many requests, retry after ${Math.ceil(
            (bucket.resetAt - now) / 1000
          )}s`,
          429
        )
      );
    }

    // Nếu nằm trong giới hạn cho phép, tiếp tục xử lý
    return next();
  };
}

module.exports = {
  createRateLimit, // Export hàm tạo middleware linh hoạt cho từng route
  resetRateLimitStore: () => bucketStore.clear(), // Hàm hỗ trợ dọn dẹp bộ nhớ (thường dùng cho Test)
};
