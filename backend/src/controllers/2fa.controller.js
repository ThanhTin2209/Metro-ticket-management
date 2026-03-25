const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

// Bước 1: Thiết lập 2FA (Tạo mã QR)
async function setup2FA(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Tạo mã bí mật (Secret key) cho 2FA
    const secret = speakeasy.generateSecret({
      name: `METRONET (${user.email})`,
    });

    // Lưu mã bí mật tạm thời vào profile người dùng
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Chuyển mã bí mật thành hình ảnh QR để người dùng quét
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return next(new AppError('Có lỗi xảy ra khi tạo mã QR', 500));
      
      return successResponse(res, 'Mã QR đã được tạo', {
        qrCode: data_url,
        secret: secret.base32
      });
    });
  } catch (error) {
    return next(error);
  }
}

// Bước 2: Xác thực & Bật 2FA
async function verifyAndEnable2FA(req, res, next) {
  try {
    const { token } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.twoFactorSecret) {
      throw new AppError('Bạn chưa thực hiện bước thiết lập 2FA', 400);
    }

    // Kiểm tra token nhập vào có khớp với thuật toán TOTP không
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new AppError('Mã xác thực không chính xác', 400);
    }

    // Nếu đúng, chính thức bật trạng thái 2FA
    user.isTwoFactorEnabled = true;
    await user.save();

    return successResponse(res, 'Đã bật xác thực 2 lớp thành công', {
        isTwoFactorEnabled: true
    });
  } catch (error) {
    return next(error);
  }
}

// Bước 3: Tắt 2FA
async function disable2FA(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return successResponse(res, 'Đã tắt xác thực 2 lớp', {
        isTwoFactorEnabled: false
    });
  } catch (error) {
    return next(error);
  }
}

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/token.service");
const RefreshToken = require("../models/refreshToken.model");

// Hàm phụ để tính ngày hết hạn (copy từ auth controller nếu cần, hoặc giả lập)
function getExpiryDateFromToken(token) {
    const jwt = require('jsonwebtoken'); // Giả định dùng thư viện này
    const decoded = jwt.decode(token);
    return new Date(decoded.exp * 1000);
}

// Bước 4: Đăng nhập với 2FA
async function login2FA(req, res, next) {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);

    if (!user || !user.isTwoFactorEnabled) {
      throw new AppError('Yêu cầu không hợp lệ', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new AppError('Mã 2FA không chính xác', 401);
    }

    // Tạo token đăng nhập vì 2FA đã đúng
    const tokenPayload = { sub: String(user._id), role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const expiresAt = getExpiryDateFromToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
    });

    return successResponse(res, 'Xác thực 2FA thành công', {
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

module.exports = {
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  login2FA
};
