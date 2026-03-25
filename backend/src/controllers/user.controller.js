const User = require("../models/user.model");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const Transaction = require("../models/transaction.model");

// Lấy thông tin cá nhân của người dùng đang đăng nhập
async function getMe(req, res, next) {
  try {
    return successResponse(res, "Get profile success", { user: req.user });
  } catch (error) {
    return next(error);
  }
}

// Cập nhật thông tin cá nhân (hiện tại hỗ trợ đổi tên)
async function updateMe(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return next(new AppError("Tên không được để trống", 400));
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select("-password");
    return successResponse(res, "Cập nhật thông tin thành công", { user });
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách toàn bộ người dùng (Dành cho Admin)
async function getUsers(req, res, next) {
  try {
    // Lấy các tham số phân trang, lọc và sắp xếp từ Query String
    const { page, limit, role, q, sortBy, sortOrder } = req.query;
    const filter = {};
    
    // Nếu có tham số role -> thêm điều kiện lọc theo vai trò
    if (role) filter.role = role;
    
    // Nếu có tham số tìm kiếm 'q' -> tìm kiếm theo tên hoặc email (không phân biệt hoa thường)
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit; // Vị trí bắt đầu lấy bản ghi
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    
    // Thực hiện truy vấn đồng thời: lấy dữ liệu và đếm tổng số bản ghi
    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort(sort).skip(skip).limit(limit), // Loại bỏ trường mật khẩu khỏi kết quả
      User.countDocuments(filter),
    ]);

    // Trả về dữ liệu kèm thông tin phân trang cho Frontend xử lý UI
    return successResponse(res, "Get users success", {
      users,
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

// Cập nhật vai trò (Role) của một người dùng cụ thể
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params; // ID người dùng cần sửa
    const { role } = req.body; // Vai trò mới (admin/staff/inspector/passenger)

    // Cập nhật và trả về bản dữ liệu mới sau khi đã lưu thành công
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after", runValidators: true } // runValidators: chạy kiểm tra tính hợp lệ của role
    ).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return successResponse(res, "Update role success", { user });
  } catch (error) {
    return next(error);
  }
}

// Nạp tiền vào tài khoản
async function topUp(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      throw new AppError("Invalid top up amount", 400);
    }

    const user = await User.findById(req.user._id);
    user.balance += amount;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      type: 'topup',
      amount,
      description: `Nạp tiền qua Ví điện tử`,
      status: 'success'
    });

    return successResponse(res, "Top up success", { balance: user.balance });
  } catch (error) {
    return next(error);
  }
}

async function getTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, "Transactions fetched", transactions);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  updateMe,
  getUsers,
  updateUserRole,
  topUp,
  getTransactions
};
