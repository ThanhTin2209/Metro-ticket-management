const { pipeline } = require("stream/promises"); // Utility để kết nối các luồng dữ liệu một cách an toàn
const Report = require("../models/report.model"); // Model quản lý thông tin báo cáo
const { successResponse } = require("../utils/apiResponse"); // Chuẩn hóa response
const AppError = require("../utils/appError"); // Xử lý lỗi
const { queueReportGeneration, createCsvStream } = require("../services/report.service"); // Import logic worker và stream
const { saveIdempotencyResponse } = require("../middlewares/idempotency.middleware"); // Lưu response để replay khi retry

// Endpoint bắt đầu quá trình tạo báo cáo
async function createReport(req, res, next) {
  try {
    const { title, type, fromDate, toDate } = req.body;
    // Kiểm tra tính logic của khoảng thời gian
    if (new Date(fromDate) > new Date(toDate)) {
      throw new AppError("fromDate must be earlier than toDate", 400);
    }

    // Tạo bản ghi báo cáo trong DB với trạng thái ban đầu là 'pending'
    const report = await Report.create({
      title,
      type,
      fromDate,
      toDate,
      requestedBy: req.user._id,
      status: "pending",
    });

    const responseBody = {
      success: true,
      message: "Report creation initiated",
      data: { report },
    };

    // QUAN TRỌNG: Lưu kết quả phản hồi vào DB Idempotency trước khi trả về cho Client
    // Điều này giúp Client nếu gửi lại cùng Key sẽ nhận ngay kết quả này mà không tạo báo cáo mới
    await saveIdempotencyResponse(req, 201, responseBody);

    // Kích hoạt Worker Thread để xử lý tính toán báo cáo ở luồng phụ (không đợi kết quả)
    void queueReportGeneration(report);

    // Trả về phản hồi cho Client ngay lập tức
    return res.status(201).json(responseBody);
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách báo cáo với tính năng phân trang, lọc và sắp xếp
async function getReports(req, res, next) {
  try {
    const { page, limit, status, q, sortBy, sortOrder } = req.query;
    const filter = {};
    if (status) filter.status = status; // Lọc theo trạng thái report
    if (q) filter.title = { $regex: q, $options: "i" }; // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)

    const skip = (page - 1) * limit; // Tính toán offset cho phân trang
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 }; // Cấu hình sắp xếp linh hoạt

    // Thực hiện truy vấn đồng thời để tối ưu hiệu suất
    const [items, total] = await Promise.all([
      Report.find(filter).sort(sort).skip(skip).limit(limit),
      Report.countDocuments(filter), // Đếm tổng số để tính số trang
    ]);

    return successResponse(res, "Get reports success", {
      reports: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Xem chi tiết một báo cáo
async function getReportById(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      throw new AppError("Report not found", 404);
    }
    return successResponse(res, "Get report success", { report });
  } catch (error) {
    return next(error);
  }
}

// Tải xuống báo cáo định dạng CSV (Sử dụng kỹ thuật Streaming)
async function downloadReportCsv(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    // Chỉ cho phép tải khi Worker đã hoàn thành quá trình tổng hợp dữ liệu
    if (report.status !== "completed") {
      throw new AppError("Report must be completed before download", 409);
    }

    const fileName = `report-${report._id}.csv`;
    // Thiết lập HTTP Header để trình duyệt hiểu đây là tệp tin tải về (CSV)
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);

    // Dùng pipeline để bơm trực tiếp dữ liệu từ Stream vào đối tượng Response (Giao thức HTTP)
    // Giúp tải file cực lớn mà không tốn nhiều RAM của Server
    await pipeline(createCsvStream(report), res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReport,
  getReports,
  getReportById,
  downloadReportCsv,
};
