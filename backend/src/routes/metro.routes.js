const express = require("express");
const {
  purchaseTicket,
  getMyTickets,
  validateEntry,
  manualInspection,
  getValidations,
  reportIncident,
  resolveIncident,
  getIncidents,
  createViolation,
  getViolations,
  getInspectionHistory,
  getMetroData
} = require("../controllers/metro.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createRateLimit } = require("../middlewares/rateLimit.middleware");
const {
  validateEntrySchema,
  manualInspectionSchema,
} = require("../validators/metro.validator");

const router = express.Router();

router.post(
  "/tickets/purchase",
  authenticate,
  authorizeRoles("passenger", "admin"),
  purchaseTicket
);

router.get(
  "/my-tickets",
  authenticate,
  authorizeRoles("passenger", "admin", "staff", "inspector"),
  getMyTickets
);

router.post(
  "/tickets/:ticketCode/validate-entry",
  authenticate,
  authorizeRoles("staff", "admin"),
  createRateLimit({ windowMs: 60_000, limit: 30 }),
  validate(validateEntrySchema),
  validateEntry
);

router.post(
  "/tickets/:ticketCode/manual-inspection",
  authenticate,
  authorizeRoles("inspector", "admin"),
  createRateLimit({ windowMs: 60_000, limit: 15 }),
  // (Optional: validate(manualInspectionSchema),) 
  manualInspection
);

// Staff History & Incidents
router.get(
  "/validations",
  authenticate,
  authorizeRoles("staff", "admin"),
  getValidations
);

router.post(
  "/incidents",
  authenticate,
  authorizeRoles("staff", "inspector", "admin"),
  reportIncident
);

router.get(
  "/incidents",
  authenticate,
  authorizeRoles("staff", "inspector", "admin"),
  getIncidents
);

router.patch(
  "/incidents/:id/resolve",
  authenticate,
  authorizeRoles("admin"),
  resolveIncident
);

// Inspector/Admin Routes
router.get(
  "/inspections",
  authenticate,
  authorizeRoles("inspector", "admin"),
  getInspectionHistory
);

router.post(
  "/violations",
  authenticate,
  authorizeRoles("inspector", "admin"),
  createViolation
);

router.get(
  "/violations",
  authenticate,
  authorizeRoles("inspector", "admin"),
  getViolations
);

// Public Metro Info
router.get("/metro-data", getMetroData);

module.exports = router;
