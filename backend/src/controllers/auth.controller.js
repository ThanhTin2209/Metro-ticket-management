const bcrypt = require("bcryptjs"); // Import bcryptjs để băm và so sánh mật khẩu bảo mật
const User = require("../models/user.model"); // Import model User để thao tác với DB người dùng
const RefreshToken = require("../models/refreshToken.model"); // Import model để lưu trữ Token làm mới
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../services/token.service"); // Import các hàm xử lý JWT từ service
const AppError = require("../utils/appError"); // Class xử lý lỗi tùy chỉnh
const { successResponse } = require("../utils/apiResponse"); // Hàm chuẩn hóa phản hồi thành công

// Hàm trích xuất ngày hết hạn từ Token để lưu vào Database
function getExpiryDateFromToken(token) {
  const payload = verifyRefreshToken(token); // Giải mã token để lấy dữ liệu bên trong
  return new Date(payload.exp * 1000); // Chuyển đổi timestamp Unix sang đối tượng Date của JS
}

// Xử lý đăng ký người dùng mới
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body; // Lấy thông tin từ body request
    // Kiểm tra tính hợp lệ cơ bản của dữ liệu đầu vào
    if (!name || !email || !password || password.length < 6) {
      throw new AppError("Invalid register payload", 400);
    }

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("Email already exists", 409);
    }

    // Băm mật khẩu với salt vòng lặp là 10 để bảo mật
    const passwordHash = await bcrypt.hash(password, 10);
    // Tạo bản ghi người dùng mới trong MongoDB
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    // Trả về thông tin người dùng (không kèm mật khẩu)
    return successResponse(
      res,
      "Register success",
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
      201
    );
  } catch (error) {
    return next(error); // Chuyển lỗi cho error middleware xử lý
  }
}

// Xử lý đăng nhập
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã băm trong DB
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Kiểm tra xem người dùng có bật xác thực 2 lớp (2FA) không
    if (user.isTwoFactorEnabled) {
      return successResponse(res, "Cần xác thực 2 bước (2FA)", {
        requires2FA: true,
        userId: user._id
      });
    }

    // Tạo payload chứa ID và quyền hạn của người dùng
    const tokenPayload = { sub: String(user._id), role: user.role };
    // Tạo cặp Access Token (ngắn hạn) và Refresh Token (dài hạn)
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const expiresAt = getExpiryDateFromToken(refreshToken);

    // Lưu Refresh Token vào DB để quản lý phiên làm việc và thu hồi khi cần
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
      userAgent: req.header('user-agent'),
      ip: req.ip
    });

    return successResponse(res, "Login success", {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Xử lý cấp lại Access Token mới dựa trên Refresh Token
async function refreshAccessToken(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      throw new AppError("refreshToken is required", 400);
    }

    // Kiểm tra tính hợp lệ của token (chữ ký, hết hạn)
    const payload = verifyRefreshToken(refreshToken);
    // Kiểm tra xem token có tồn tại trong DB và chưa bị thu hồi không
    const record = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      throw new AppError("Refresh token invalid or revoked", 401);
    }

    // Đánh dấu token cũ là đã bị thu hồi (vô hiệu hóa sau khi dùng)
    await RefreshToken.updateOne({ _id: record._id }, { isRevoked: true });

    // Tạo cặp token mới
    const nextPayload = { sub: payload.sub, role: payload.role };
    const newAccessToken = generateAccessToken(nextPayload);
    const newRefreshToken = generateRefreshToken(nextPayload);
    const newExpiresAt = getExpiryDateFromToken(newRefreshToken);

    // Lưu Refresh Token mới vào database
    await RefreshToken.create({
      userId: payload.sub,
      token: newRefreshToken,
      expiresAt: newExpiresAt,
    });

    return successResponse(res, "Refresh token success", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

// Xử lý đăng xuất
async function logout(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      throw new AppError("refreshToken is required", 400);
    }

    // Vô hiệu hóa Refresh Token trong DB để kết thúc phiên làm việc
    await RefreshToken.updateOne({ token: refreshToken }, { isRevoked: true });

    return successResponse(res, "Logout success", {});
  } catch (error) {
    return next(error);
  }
}

const crypto = require("crypto");

// ... existing code ...

// Quy trình Quên mật khẩu bảo mật: Tạo token khôi phục và gửi qua email
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Trong thực tế, có thể trả về 200 "Nếu email tồn tại, link sẽ được gửi" để tránh lộ thông tin người dùng
      throw new AppError("Email không tồn tại trong hệ thống", 404);
    }

    // Tạo token ngẫu nhiên không thể đoán được (dài 40 ký tự hex)
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    // Lưu token và thời gian hết hạn (1 giờ) vào database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 60 phút
    await user.save();

    // LƯU Ý BẢO MẬT: Trong thực tế, bạn PHẢI gửi resetToken này qua Email của người dùng
    // Ở đây tôi trả về trong response để bạn có thể test quy trình mà không cần setup Email Server
    return successResponse(res, "Mã khôi phục đã được tạo thành công. Vui lòng kiểm tra email của bạn.", {
      resetToken: resetToken,
      note: "Trong thực tế, mã này sẽ được gửi bí mật vào email và KHÔNG hiển thị ở đây."
    });
  } catch (error) {
    return next(error);
  }
}

// Đặt lại mật khẩu bằng token
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Token không hợp lệ hoặc đã hết hạn", 400);
    }

    // Băm mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    // Xóa token reset sau khi dùng xong
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResponse(res, "Đặt lại mật khẩu thành công", {});
  } catch (error) {
    return next(error);
  }
}

// Đổi mật khẩu (Yêu cầu đã đăng nhập)
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id; // Lấy từ auth middleware (passport/jwt)

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404);
    }

    // Kiểm tra mật khẩu cũ
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      throw new AppError("Mật khẩu cũ không chính xác", 400);
    }

    // Băm mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();

    return successResponse(res, "Đổi mật khẩu thành công", {});
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
