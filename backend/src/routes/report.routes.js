const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  downloadReportCsv,
} = require("../controllers/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createRateLimit } = require("../middlewares/rateLimit.middleware");
const { enforceIdempotency } = require("../middlewares/idempotency.middleware");
const {
  createReportSchema,
  reportListQuerySchema,
} = require("../validators/report.validator");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.post(
  "/",
  createRateLimit({ limit: 10, windowMs: 60_000 }),
  enforceIdempotency,
  validate(createReportSchema),
  createReport
);

router.get("/", validate(reportListQuerySchema, "query"), getReports);
router.get("/:id", getReportById);
router.get("/:id/download", downloadReportCsv);

module.exports = router;
