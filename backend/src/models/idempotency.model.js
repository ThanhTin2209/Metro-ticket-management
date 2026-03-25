const mongoose = require("mongoose"); // Import thư viện Mongoose để định nghĩa Schema cho MongoDB

// Định nghĩa cấu trúc lưu trữ cho cơ chế Idempotency (chống trùng lặp request)
const idempotencySchema = new mongoose.Schema(
  {
    // Key duy nhất do Client gửi lên (ví dụ: UUID) để định danh request
    key: { type: String, required: true, unique: true },
    // Phương thức HTTP (POST, PUT...) của request gốc
    method: { type: String, required: true },
    // Đường dẫn API (ví dụ: /api/reports) của request gốc
    path: { type: String, required: true },
    // Mã băm (Hash) của toàn bộ dữ liệu request để kiểm tra tính toàn vẹn khi retry
    requestHash: { type: String, required: true },
    // Mã trạng thái HTTP (ví dụ: 201) đã trả về ở lần thực hiện đầu tiên
    statusCode: { type: Number, required: true },
    // Nội dung JSON phản hồi đã trả về lần trước để Server có thể "replay" lại
    responseBody: { type: mongoose.Schema.Types.Mixed, required: true },
    // Thời điểm bản ghi này sẽ tự động bị xóa khỏi DB (TTL - Time To Live)
    // expireAfterSeconds: 0 nghĩa là nó sẽ hết hạn ngay tại thời điểm expiresAt
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  // Tự động thêm trường createdAt và updatedAt cho bản ghi
  { timestamps: true }
);

// Xuất model "IdempotencyKey" để sử dụng trong Middleware/Controller
module.exports = mongoose.model("IdempotencyKey", idempotencySchema);
