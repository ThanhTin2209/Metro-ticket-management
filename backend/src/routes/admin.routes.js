const express = require("express");
const { 
  createLine, 
  getLines, 
  updateLine,
  deleteLine,
  createStation, 
  getStations,
  updateStation,
  updateStationStatus,
  deleteStation,
  toggleAllMetroStatus,
  updateTicketPrice,
  getDashboardStats,
  getReportStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
} = require("../controllers/admin.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

// Dashboard & Analytics
router.get("/stats", getDashboardStats);
router.get("/report-stats", getReportStats);

// User Management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Line Management
router.post("/lines", createLine);
router.get("/lines", getLines);
router.patch("/lines/:id", updateLine);
router.delete("/lines/:id", deleteLine);

// Station Management
router.post("/stations", createStation);
router.get("/stations", getStations);
router.patch("/stations/:id", updateStation);
router.patch("/stations/:id/status", updateStationStatus);
router.delete("/stations/:id", deleteStation);
router.patch("/metro/toggle-all", toggleAllMetroStatus);

// Pricing & Config
router.patch("/pricing", updateTicketPrice);

module.exports = router;
