const path = require("path"); // Import module 'path' để xử lý đường dẫn tệp tin
const { Worker } = require("worker_threads"); // Import class Worker để chạy code ở một luồng (thread) riêng biệt
const { Readable } = require("stream"); // Import class Readable để tạo các luồng dữ liệu có thể đọc được
const Report = require("../models/report.model"); // Import model Report để tương tác với MongoDB
const { domainEvents, DOMAIN_EVENTS } = require("../events/domainEvents"); // Import hệ thống sự kiện nội bộ của ứng dụng
const AppError = require("../utils/appError"); // Import class xử lý lỗi tùy chỉnh

// Xác định đường dẫn tuyệt đối đến tệp worker.js để chạy tác vụ nặng
const workerPath = path.resolve(__dirname, "../workers/report.worker.js");

// Hàm chính để đưa yêu cầu tạo báo cáo vào hàng chờ xử lý
async function queueReportGeneration(report) {
  try {
    // Phát sự kiện thông báo một báo cáo mới đã được tạo cho các module khác
    domainEvents.emit(DOMAIN_EVENTS.REPORT_CREATED, {
      reportId: report._id, // Gửi kèm ID của báo cáo
      ...report.toObject(), // Trải toàn bộ dữ liệu của báo cáo vào object sự kiện
    });

    // Tạo một Worker mới để thực thi tính toán báo cáo mà không chặn luồng chính
    const worker = new Worker(workerPath, {
      workerData: { // Truyền dữ liệu đầu vào cho Worker qua thuộc tính workerData
        fromDate: report.fromDate, // Ngày bắt đầu lọc dữ liệu
        toDate: report.toDate, // Ngày kết thúc lọc dữ liệu
      },
    });

    // Cập nhật trạng thái của báo cáo thành 'processing' (đang được xử lý)
    await Report.findByIdAndUpdate(report._id, { status: "processing" });
    
    // Phát sự kiện thông báo trạng thái báo cáo đã chuyển sang đang xử lý
    domainEvents.emit(DOMAIN_EVENTS.REPORT_STATUS_CHANGED, {
      reportId: report._id, // ID của báo cáo mục tiêu
      status: "processing", // Trạng thái mới
    });

    // Lắng nghe sự kiện 'message' từ Worker khi nó hoàn thành công việc
    worker.on("message", async (result) => {
      const mongoose = require("mongoose"); // Import mongoose cục bộ để kiểm tra kết nối
      if (mongoose.connection.readyState !== 1) return; // Nếu DB chưa sẵn sàng thì thoát

      if (result.error) {
        // Nếu Worker trả về lỗi, cập nhật trạng thái báo cáo là 'failed' (thất bại)
        await Report.findByIdAndUpdate(report._id, {
          status: "failed", // Trạng thái thất bại
          errorMessage: result.error, // Lưu thông báo lỗi chi tiết
        });
      } else {
        // Nếu Worker thành công, cập nhật các con số thống kê kết quả vào DB
        await Report.findByIdAndUpdate(report._id, {
          status: "completed", // Trạng thái hoàn thành
          totalEntries: result.totalEntries, // Tổng số lượt vào ga
          totalInspections: result.totalInspections, // Tổng số lượt kiểm tra thủ công
          workerDurationMs: result.workerDurationMs, // Thời gian worker chạy thực tế
        });
      }
      
      // Phát sự kiện cập nhật trạng thái cuối cùng (thành công hoặc thất bại)
      domainEvents.emit(DOMAIN_EVENTS.REPORT_STATUS_CHANGED, {
        reportId: report._id, // ID báo cáo
        status: result.error ? "failed" : "completed", // Trạng thái cuối
      });
    });

    // Lắng nghe sự kiện 'error' nếu Worker bị crash hoặc lỗi hệ thống nghiêm trọng
    worker.on("error", async (error) => {
      const mongoose = require("mongoose"); // Đảm bảo quyền truy cập DB
      if (mongoose.connection.readyState !== 1) return; // Kiểm tra kết nối DB

      console.error("Worker error:", error); // Log lỗi ra console để debug
      // Cập nhật trạng thái thất bại và lưu lý do lỗi hệ thống
      await Report.findByIdAndUpdate(report._id, {
        status: "failed", // Trạng thái lỗi
        errorMessage: error.message, // Thông điệp lỗi từ hệ thống
      });
      
      // Phát sự kiện thông báo lỗi cho client/socket
      domainEvents.emit(DOMAIN_EVENTS.REPORT_STATUS_CHANGED, {
        reportId: report._id, // ID báo cáo
        status: "failed", // Trạng thái lỗi
      });
    });
  } catch (error) {
    // Bắt lỗi nếu quá trình khởi tạo worker hoặc emit sự kiện bị thất bại
    console.error("Failed to queue report:", error);
  }
}

// Hàm khởi tạo một luồng dữ liệu (Stream) để tạo nội dung CSV cho báo cáo
function createCsvStream(report) {
  if (!report) {
    // Nếu không có dữ liệu báo cáo thì quăng lỗi 400
    throw new AppError("Report is required", 400);
  }

  if (report.status !== "completed") {
    // Nếu báo cáo chưa xong thì không cho phép tạo stream tải về
    throw new AppError("Report is not ready for download", 409);
  }

  // Tạo mảng các dòng dữ liệu cho tệp CSV
  const csvRows = [
    "field,value\n", // Dòng tiêu đề của CSV
    `reportId,${report._id}\n`, // ID báo cáo
    `title,${report.title}\n`, // Tiêu đề báo cáo
    `type,${report.type}\n`, // Loại báo cáo
    `fromDate,${report.fromDate.toISOString()}\n`, // Từ ngày
    `toDate,${report.toDate.toISOString()}\n`, // Đến ngày
    `totalEntries,${report.totalEntries || 0}\n`, // Tổng dữ liệu 1
    `totalInspections,${report.totalInspections || 0}\n`, // Tổng dữ liệu 2
    `workerDurationMs,${report.workerDurationMs || 0}\n`, // Thời gian thực thi
    `generatedAt,${new Date().toISOString()}\n`, // Thời điểm xuất file
  ];

  // Trả về luồng dữ liệu (Stream) giúp Node.js gửi file lớn hiệu quả hơn
  return Readable.from(csvRows, { encoding: "utf8" });
}

module.exports = {
  queueReportGeneration, // Export hàm đẩy việc vào worker
  createCsvStream, // Export hàm tạo stream CSV
};
