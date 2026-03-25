const express = require("express");
const {
  register,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { createRateLimit } = require("../middlewares/rateLimit.middleware");
const { protect } = require("../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  createRateLimit({ windowMs: 60_000, limit: 20 }),
  validate(registerSchema),
  register
);
router.post(
  "/login",
  createRateLimit({ windowMs: 60_000, limit: 10 }),
  validate(loginSchema),
  login
);

router.post("/refresh-token", validate(refreshSchema), refreshAccessToken);
router.post("/logout", validate(refreshSchema), logout);

// Quên và đặt lại mật khẩu
router.post(
  "/forgot-password",
  createRateLimit({ windowMs: 15 * 60_000, limit: 20 }),
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  createRateLimit({ windowMs: 15 * 60_000, limit: 5 }),
  validate(resetPasswordSchema),
  resetPassword
);

// Đổi mật khẩu (Yêu cầu đăng nhập)
router.post(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);

const {
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  login2FA
} = require("../controllers/2fa.controller");

// ... (existing routes) ...

// Xác thực 2 lớp (2FA)
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify", protect, verifyAndEnable2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/login", login2FA);

const {
  getMySessions,
  revokeSession
} = require("../controllers/session.controller");

// ... (existing routes) ...

// Quản lý phiên đăng nhập (Sessions)
router.get("/sessions", protect, getMySessions);
router.delete("/sessions/:sessionId", protect, revokeSession);

module.exports = router;
