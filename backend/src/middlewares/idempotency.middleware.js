const IdempotencyKey = require("../models/idempotency.model"); // Model lưu trữ các phản hồi API cũ kèm key
const AppError = require("../utils/appError"); // Class xử lý lỗi
const { calculateHash } = require("../utils/hash"); // Hàm tiện ích để tạo mã băm (hash) từ dữ liệu request

// Middleware đảm bảo một request giống hệt nhau chỉ thực hiện một lần duy nhất
async function enforceIdempotency(req, res, next) {
  try {
    // Lấy giá trị Idempotency-Key từ header gửi lên
    const key = req.header("Idempotency-Key");
    if (!key) {
      // Báo lỗi 400 nếu thiếu header bắt buộc này
      return next(new AppError("Idempotency-Key header is required", 400));
    }

    // Tính toán mã băm từ phương thức, đường dẫn và dữ liệu trong thân (body) của request
    const requestHash = calculateHash({
      method: req.method,
      path: req.path,
      body: req.body,
    });
    
    // Tìm kiếm xem Key này đã được server xử lý trước đó chưa
    const existingEntry = await IdempotencyKey.findOne({ key });

    if (existingEntry) {
      // Nếu Key tồn tại và mã băm dữ liệu hoàn toàn giống lần trước
      if (existingEntry.requestHash === requestHash) {
        // "Phát" lại phản hồi cũ mà không chạy lại logic nghiệp vụ
        return res
          .status(existingEntry.statusCode) // Trả về mã trạng thái như lần trước (ví dụ 201)
          .set("X-Idempotency-Replayed", "true") // Header báo cho client đây là dữ liệu 'xài lại'
          .json(existingEntry.responseBody); // Trả lại nội dung JSON đã lưu
      } else {
        // Nếu Key trùng nhưng dữ liệu bên trong khác -> Xung đột (Conflict)
        return next(new AppError("Idempotency-Key conflict with different payload", 409));
      }
    }

    // Nếu là request mới, lưu tạm thông tin key và hash vào đối tượng request để dùng ở bước sau
    req.idempotency = { key, requestHash };
    return next(); // Chuyển sang bước xử lý nghiệp vụ tiếp theo
  } catch (error) {
    return next(error);
  }
}

// Lưu phản hồi của API vào Database để phục vụ việc "Replay" ở lần gọi sau
async function saveIdempotencyResponse(req, statusCode, body) {
  try {
    // Nếu request này không yêu cầu idempotency thì bỏ qua
    if (!req.idempotency?.key) return;

    const { key, requestHash } = req.idempotency;
    // Thiết lập thời gian hết hạn cho Key là 1 giờ kể từ lúc lưu
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    // Cập nhật hoặc chèn mới (upsert) bản ghi thông tin phản hồi
    await IdempotencyKey.findOneAndUpdate(
      { key }, // Tìm theo key
      {
        key,
        method: req.method,
        path: req.path,
        requestHash,
        statusCode,
        responseBody: body,
        expiresAt,
      },
      { upsert: true, returnDocument: "after" } // Nếu không có thì tạo mới
    );
  } catch (error) {
    // Ghi log lỗi nếu không lưu được nhưng không chặn luồng trả về cho Client
    console.error("Error saving idempotency response:", error);
  }
}

module.exports = {
  enforceIdempotency, // Middleware dùng trước khi vào Controller
  saveIdempotencyResponse, // Hàm dùng cuối Controller để lưu kết quả
};
