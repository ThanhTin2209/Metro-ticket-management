const express = require("express");
const {
  getMe,
  updateMe,
  getUsers,
  updateUserRole,
  topUp,
  getTransactions
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  updateRoleSchema,
  getUsersQuerySchema,
} = require("../validators/user.validator");

const router = express.Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);

router.post("/top-up", authenticate, topUp);

router.get("/transactions", authenticate, getTransactions);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(getUsersQuerySchema, "query"),
  getUsers
);

router.patch(
  "/:id/role",
  authenticate,
  authorizeRoles("admin"),
  validate(updateRoleSchema),
  updateUserRole
);

module.exports = router;
