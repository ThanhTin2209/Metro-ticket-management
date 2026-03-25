const mongoose = require("mongoose"); // Module Mongoose để làm việc với MongoDB

// Định nghĩa Schema lưu trữ lịch sử các sự kiện xảy ra trong hệ thống tàu điện (Metro)
const metroEventSchema = new mongoose.Schema(
  {
    // Mã vé liên quan đến sự kiện (indexed: true để tìm kiếm nhanh theo vé)
    ticketCode: { type: String, required: true, index: true },
    // Loại sự kiện xảy ra
    eventType: {
      type: String,
      enum: ["entry_validated", "manual_inspection"], // Chỉ chấp nhận 2 loại: quét vé vào ga hoặc kiểm tra thủ công
      required: true,
    },
    // Mã nhà ga nơi sự kiện diễn ra (ví dụ: GA_BEN_THANH)
    stationCode: { type: String, default: null },
    // Lý do thực hiện kiểm tra (thường dùng cho loại manual_inspection)
    reason: { type: String, default: null },
    // Kết quả của sự kiện (ví dụ: ALLOW_ENTRY hoặc PENDING_REVIEW)
    result: { type: String, default: null },
    // Thông tin người thực hiện thao tác này
    performedBy: {
      // Liên kết tới ID của người dùng trong collection 'users'
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      // Lưu lại vai trò của người thực hiện tại thời điểm đó (staff/inspector/admin)
      role: { type: String, required: true },
    },
    // Thời điểm thực tế sự kiện xảy ra
    occurredAt: { type: Date, default: Date.now },
  },
  // Tự động lưu thời gian tạo/cập nhật bản ghi trong hệ thống
  { timestamps: true }
);

// Xuất model MetroEvent phục vụ việc lưu vết và báo cáo
module.exports = mongoose.model("MetroEvent", metroEventSchema);
