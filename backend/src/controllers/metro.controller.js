const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Incident = require("../models/incident.model");
const Violation = require("../models/violation.model");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const MetroEvent = require("../models/metroEvent.model");
const { domainEvents, DOMAIN_EVENTS } = require("../events/domainEvents");

// Xử lý mua vé của hành khách
async function purchaseTicket(req, res, next) {
  try {
    const { type, origin, destination } = req.body;
    const userId = req.user._id;

    if (!type || !type.name || !type.price) {
      throw new AppError("Ticket type and price are required", 400);
    }

    const user = await User.findById(userId);
    if (user.balance < type.price) {
      throw new AppError("Insufficient balance", 400);
    }

    user.balance -= type.price;
    await user.save();

    const ticketCode = `TKT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const ticket = await Ticket.create({
      code: ticketCode,
      owner: userId,
      type,
      origin,
      destination,
      expiryDate,
    });

    await Transaction.create({
      userId,
      type: 'purchase',
      amount: type.price,
      description: `Mua vé Metro: ${type.name}`,
      status: 'success',
      referenceId: ticket._id
    });

    domainEvents.emit(DOMAIN_EVENTS.TICKET_PURCHASED, { 
      ticketId: ticket._id, 
      userId, 
      price: type.price 
    });

    return successResponse(res, "Ticket purchased successfully", { ticket, balance: user.balance });
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách vé của tôi
async function getMyTickets(req, res, next) {
  try {
    const tickets = await Ticket.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, "Tickets fetched", tickets);
  } catch (error) {
    return next(error);
  }
}

// Xử lý xác thực vé khi hành khách vào cổng
async function validateEntry(req, res, next) {
  try {
    const { ticketCode } = req.params;
    const { stationCode } = req.body;

    const ticket = await Ticket.findOne({ code: ticketCode }).populate('owner', 'name email');
    if (!ticket) throw new AppError("Ticket not found", 404);

    if (ticket.status !== 'active') {
       return successResponse(res, "Ticket validation result", { 
         validationStatus: ticket.status.toUpperCase(),
         ticket
       });
    }

    if (new Date() > ticket.expiryDate) {
       ticket.status = 'expired';
       await ticket.save();
       return successResponse(res, "Ticket validation result", { 
         validationStatus: 'EXPIRED',
         ticket
       });
    }

    ticket.status = 'used';
    ticket.usageHistory.push({ stationCode, action: 'entry' });
    await ticket.save();

    const payload = {
      ticketCode,
      stationCode,
      validationStatus: "ALLOW",
      ticket,
      checkedBy: { userId: req.user._id, role: req.user.role },
      checkedAt: new Date().toISOString(),
    };

    await MetroEvent.create({
      ticketCode,
      eventType: "entry_validated",
      stationCode,
      result: payload.validationStatus,
      performedBy: payload.checkedBy,
    });

    domainEvents.emit(DOMAIN_EVENTS.TICKET_ENTRY_VALIDATED, payload);
    return successResponse(res, "Ticket validated", payload);
  } catch (error) {
    return next(error);
  }
}

// Xử lý ghi nhận kiểm tra vé thủ công
async function manualInspection(req, res, next) {
  try {
    const { ticketCode } = req.params;
    const ticket = await Ticket.findOne({ code: ticketCode }).populate('owner', 'name email');
    if (!ticket) throw new AppError("Ticket not found", 404);

    const payload = {
      ticketCode,
      ticket,
      createdBy: { userId: req.user._id, role: req.user.role },
      createdAt: new Date().toISOString(),
    };

    const inspectionEvent = await MetroEvent.create({
      ticketCode,
      eventType: "manual_inspection",
      result: "CHECKED",
      performedBy: payload.createdBy,
    });

    domainEvents.emit(DOMAIN_EVENTS.TICKET_MANUAL_INSPECTION_CREATED, payload);
    return successResponse(res, "Manual inspection recorded", { 
      isValid: true, 
      ticket, 
      inspectionEvent 
    });
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách vé đã được thực soát (Validate)
async function getValidations(req, res, next) {
  try {
    const validations = await MetroEvent.find({ eventType: 'entry_validated' })
      .populate('performedBy.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    return successResponse(res, "Validation history fetched", validations);
  } catch (error) {
    return next(error);
  }
}

// Báo cáo sự cố mới
async function reportIncident(req, res, next) {
  try {
    const { type, severity, location, description } = req.body;
    const incident = await Incident.create({
      reporterId: req.user._id,
      reporterRole: req.user.role,
      type,
      severity,
      location,
      description
    });
    domainEvents.emit(DOMAIN_EVENTS.METRO_INCIDENT_REPORTED, incident);
    return successResponse(res, "Incident reported successfully", incident);
  } catch (error) {
    return next(error);
  }
}

// Giải quyết sự cố
async function resolveIncident(req, res, next) {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndUpdate(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: req.user._id
    }, { new: true });
    if (!incident) throw new AppError("Incident not found", 404);
    domainEvents.emit(DOMAIN_EVENTS.METRO_INCIDENT_RESOLVED, incident);
    return successResponse(res, "Incident resolved", incident);
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách sự cố
async function getIncidents(req, res, next) {
  try {
    const incidents = await Incident.find()
      .populate('reporterId', 'name')
      .sort({ createdAt: -1 });
    return successResponse(res, "Incidents fetched", incidents);
  } catch (error) {
    return next(error);
  }
}

// Lập biên bản vi phạm mới
async function createViolation(req, res, next) {
  try {
    const { ticketCode, violatorName, type, severity, location, description, fineAmount, evidenceImages } = req.body;
    const violation = await Violation.create({
      inspectorId: req.user._id,
      ticketCode,
      violatorName,
      type,
      severity,
      location,
      description,
      fineAmount,
      evidenceImages
    });
    return successResponse(res, "Violation recorded", violation);
  } catch (error) {
    return next(error);
  }
}

// Lấy danh sách biên bản vi phạm
async function getViolations(req, res, next) {
  try {
    const violations = await Violation.find()
      .populate('inspectorId', 'name')
      .sort({ createdAt: -1 });
    return successResponse(res, "Violations fetched", violations);
  } catch (error) {
    return next(error);
  }
}

// Lấy lịch sử kiểm tra thủ công
async function getInspectionHistory(req, res, next) {
  try {
    const inspections = await MetroEvent.find({ eventType: 'manual_inspection' })
      .populate('performedBy.userId', 'name')
      .sort({ createdAt: -1 });
    return successResponse(res, "Inspection history fetched", inspections);
  } catch (error) {
    return next(error);
  }
}

// Lấy dữ liệu toàn bộ hệ thống Metro (Public)
async function getMetroData(req, res, next) {
  try {
    const Line = require("../models/line.model");
    const lines = await Line.find().populate('stations');
    return successResponse(res, "Metro data fetched", lines);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
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
};
