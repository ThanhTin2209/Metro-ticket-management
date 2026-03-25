const Line = require("../models/line.model");
const Station = require("../models/station.model");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Incident = require("../models/incident.model");
const AppError = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

// --- DASHBOARD STATS ---
async function getDashboardStats(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const [revenueData, userCount, ticketCount, incidentCount] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'purchase', status: 'success', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      User.countDocuments(),
      Ticket.countDocuments({ createdAt: { $gte: today } }),
      Incident.countDocuments({ status: 'OPEN' })
    ]);

    return successResponse(res, "Stats fetched", {
      revenue: revenueData[0]?.total || 0,
      userCount,
      ticketCount,
      incidentCount
    });
  } catch (err) { next(err); }
}

// --- LINE MANAGEMENT ---
async function createLine(req, res, next) {
  try {
    const line = await Line.create(req.body);
    return successResponse(res, "Line created", line);
  } catch (err) { next(err); }
}

async function getLines(req, res, next) {
  try {
    const lines = await Line.find().populate('stations');
    return successResponse(res, "Lines fetched", lines);
  } catch (err) { next(err); }
}

// --- STATION MANAGEMENT ---
async function createStation(req, res, next) {
  try {
    const station = await Station.create(req.body);
    // If line ID provided, link station to line
    if (req.body.lineId) {
       await Line.findByIdAndUpdate(req.body.lineId, {
          $push: { stations: station._id }
       });
       station.lines.push(req.body.lineId);
       await station.save();
    }
    return successResponse(res, "Station created", station);
  } catch (err) { next(err); }
}

async function getStations(req, res, next) {
  try {
    const stations = await Station.find().populate('lines');
    return successResponse(res, "Stations fetched", stations);
  } catch (err) { next(err); }
}

async function updateStationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const station = await Station.findByIdAndUpdate(id, { status }, { new: true });
    return successResponse(res, "Station status updated", station);
  } catch (err) { next(err); }
}

async function updateStation(req, res, next) {
  try {
    const { id } = req.params;
    const station = await Station.findByIdAndUpdate(id, req.body, { new: true });
    return successResponse(res, "Station updated", station);
  } catch (err) { next(err); }
}

async function deleteStation(req, res, next) {
  try {
    const { id } = req.params;
    const station = await Station.findByIdAndDelete(id);
    if (station) {
       await Line.updateMany({ stations: id }, { $pull: { stations: id } });
    }
    return successResponse(res, "Station deleted", { id });
  } catch (err) { next(err); }
}

async function updateLine(req, res, next) {
  try {
    const { id } = req.params;
    const line = await Line.findByIdAndUpdate(id, req.body, { new: true });
    return successResponse(res, "Line updated", line);
  } catch (err) { next(err); }
}

async function deleteLine(req, res, next) {
  try {
    const { id } = req.params;
    await Line.findByIdAndDelete(id);
    // Also remove reference from stations that belong ONLY to this line
    await Station.updateMany({ lines: id }, { $pull: { lines: id } });
    return successResponse(res, "Line deleted", { id });
  } catch (err) { next(err); }
}

// --- TICKET PRICING / STATS ---
async function updateTicketPrice(req, res, next) {
  // Logic to update price in a configuration or on existing ticket types
  // For now, return mock success as pricing is handled on frontend for MVP
  return successResponse(res, "Ticket pricing updated", req.body);
}

async function getReportStats(req, res, next) {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const stats = await Transaction.aggregate([
      {
        $match: {
          type: 'purchase',
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill missing days
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
       const d = new Date(sevenDaysAgo);
       d.setDate(sevenDaysAgo.getDate() + i);
       const dateStr = d.toISOString().split('T')[0];
       const found = stats.find(s => s._id === dateStr);
       revenueData.push({
          day: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
          revenue: found ? found.revenue : 0
       });
    }

    return successResponse(res, "Report stats fetched", { revenueData });
  } catch (err) { next(err); }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, "Users fetched", users);
  } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError("Email đã tồn tại", 400));
    
    // User model middleware handles password hashing (pre-save)
    const user = await User.create({ name, email, password, role });
    const userObj = user.toObject();
    delete userObj.password;
    
    return successResponse(res, "Người dùng mới đã được tạo", userObj, 201);
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, role }, { new: true }).select('-password');
    return successResponse(res, "Thông tin người dùng đã cập nhật", user);
  } catch (err) { next(err); }
}

async function updateUserRole(req, res, next) {
  try {
     const { id } = req.params;
     const { role } = req.body;
     const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
     return successResponse(res, "User role updated", user);
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return successResponse(res, "Người dùng đã bị xóa", { id });
  } catch (err) { next(err); }
}

async function toggleAllMetroStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'maintenance'].includes(status)) {
      return next(new AppError(400, "Invalid status"));
    }
    await Line.updateMany({}, { status });
    await Station.updateMany({}, { status });
    return successResponse(res, `Đã chuyển toàn bộ hệ thống sang trạng thái ${status}`);
  } catch (err) { next(err); }
}

module.exports = {
  getDashboardStats,
  getReportStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  createLine,
  getLines,
  updateLine,
  deleteLine,
  createStation,
  getStations,
  updateStation,
  updateStationStatus,
  toggleAllMetroStatus,
  deleteStation,
  updateTicketPrice
};
