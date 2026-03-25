const RefreshToken = require('../models/refreshToken.model');
const { successResponse } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

// Lấy danh sách tất cả phiên đăng nhập của người dùng hiện tại
async function getMySessions(req, res, next) {
  try {
    const userId = req.user._id;
    const sessions = await RefreshToken.find({ 
      userId, 
      isRevoked: false, 
      expiresAt: { $gt: new Date() } 
    }).sort({ updatedAt: -1 });

    return successResponse(res, 'Danh sách phiên hoạt động', { sessions });
  } catch (error) {
    return next(error);
  }
}

// Thu hồi một phiên đăng nhập (Đăng xuất từ xa)
async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await RefreshToken.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new AppError('Không tìm thấy phiên đăng nhập này', 404);
    }

    session.isRevoked = true;
    await session.save();

    return successResponse(res, 'Đã kết thúc phiên đăng nhập thành công', {});
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMySessions,
  revokeSession
};
