const mongoose = require("mongoose"); // Thư viện ODM mạnh mẽ cho MongoDB trong Node.js

// Định nghĩa cấu trúc lưu trữ cho các báo cáo được hệ thống tạo ra (xử lý bởi Worker Thread)
const reportSchema = new mongoose.Schema(
  {
    // Tiêu đề của báo cáo (ví dụ: Báo cáo lưu lượng tháng 3)
    title: { type: String, required: true, trim: true },
    // Loại báo cáo (theo ngày, tuần, tháng hoặc tùy chỉnh)
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"], // Chỉ chấp nhận các giá trị này
      default: "daily",
    },
    // Thời điểm bắt đầu của khoảng dữ liệu cần báo cáo
    fromDate: { type: Date, required: true },
    // Thời điểm kết thúc của khoảng dữ liệu cần báo cáo
    toDate: { type: Date, required: true },
    // Trạng thái vòng đời của báo cáo (Dùng để hiển thị tiến độ trên UI)
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"], 
      default: "pending", // Mới tạo sẽ ở trạng thái chờ
    },
    // Người dùng đã gửi yêu cầu tạo báo cáo này
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết tới collection users
      required: true,
    },
    // Kết quả: Tổng số lượt hành khách vào ga trích xuất bởi Worker
    totalEntries: { type: Number, default: 0 },
    // Kết quả: Tổng số lượt kiểm tra thủ công trích xuất bởi Worker
    totalInspections: { type: Number, default: 0 },
    // Thời gian thực tế mà luồng Worker chạy để hoàn thành báo cáo (mili giây)
    workerDurationMs: { type: Number, default: 0 },
    // Lưu nội dung lỗi nếu trạng thái báo cáo là 'failed'
    errorMessage: { type: String, default: null },
  },
  // Tự động tạo các mốc thời gian createdAt và updatedAt
  { timestamps: true }
);

// Chuyển Schema thành Model để thực hiện các truy vấn trong ứng dụng
module.exports = mongoose.model("Report", reportSchema);
