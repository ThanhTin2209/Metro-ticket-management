const AppError = require("../utils/appError"); // Tiện ích xử lý lỗi thống nhất của dự án

// Middleware để tự động hóa việc xác thực dữ liệu đầu vào bằng Joi
function validate(schema, source = "body") {
  // Tham số 'schema': luật xác thực. 'source': nơi chứa dữ liệu (body, query, hoặc params)
  return (req, res, next) => {
    // Lấy dữ liệu mục tiêu từ đối tượng request (mặc định là từ req.body)
    const target = req[source] || {};
    
    // Thực hiện việc xác thực
    const { error, value } = schema.validate(target, {
      abortEarly: false, // Tiếp tục kiểm tra hết các lỗi thay vì dừng lại ở lỗi đầu tiên
      stripUnknown: true, // Tự động loại bỏ các trường không được định nghĩa trong schema (bảo mật)
    });

    if (error) {
      // Nếu có lỗi, gom tất cả các thông báo lỗi lại thành một chuỗi và trả về lỗi 400
      return next(new AppError(error.details.map((d) => d.message).join("; "), 400));
    }

    // Gán lại dữ liệu đã được 'làm sạch' (sanitize) vào request để controller sử dụng an toàn
    req[source] = value;
    // Đi tiếp tới middleware hoặc controller tiếp theo
    return next();
  };
}

module.exports = {
  validate, // Xuất hàm để áp dụng xác thực dữ liệu cho các route cụ thể
};
