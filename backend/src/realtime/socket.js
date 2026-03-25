const { Server } = require("socket.io");
const { verifyAccessToken } = require("../services/token.service");
const User = require("../models/user.model");
const { domainEvents, DOMAIN_EVENTS } = require("../events/domainEvents");

let ioInstance = null;

async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-password");
    if (!user || !user.isActive) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
}

function attachDomainEventListeners(io) {
  // Report events -> admin only
  domainEvents.on(DOMAIN_EVENTS.REPORT_CREATED, (report) => {
    io.to("role:admin").emit("report.created", report);
  });

  domainEvents.on(DOMAIN_EVENTS.REPORT_STATUS_CHANGED, (data) => {
    io.to("role:admin").emit("report.statusChanged", data);
  });

  // Metro events -> specific roles
  domainEvents.on(DOMAIN_EVENTS.TICKET_ENTRY_VALIDATED, (data) => {
    // staff and admin
    io.to("role:staff").to("role:admin").emit("metro.ticket.entryValidated", data);
  });

  domainEvents.on(DOMAIN_EVENTS.TICKET_MANUAL_INSPECTION_CREATED, (data) => {
    // inspector and admin
    io.to("role:inspector").to("role:admin").emit("metro.ticket.manualInspectionCreated", data);
  });

  domainEvents.on(DOMAIN_EVENTS.METRO_INCIDENT_REPORTED, (incident) => {
    // staff, admin, inspector
    io.to("role:staff").to("role:admin").to("role:inspector").emit("metro.incidentReported", incident);
  });

  domainEvents.on(DOMAIN_EVENTS.METRO_INCIDENT_RESOLVED, (incident) => {
    // staff, admin, inspector
    io.to("role:staff").to("role:admin").to("role:inspector").emit("metro.incidentResolved", incident);
  });
}

function initializeSocket(server) {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: { origin: "*" },
  });

  ioInstance.use(socketAuth);

  ioInstance.on("connection", (socket) => {
    socket.join(`role:${socket.user.role}`);
    socket.join(`user:${socket.user._id}`);

    socket.emit("socket.ready", {
      userId: socket.user._id,
      role: socket.user.role,
    });
  });

  attachDomainEventListeners(ioInstance);

  return ioInstance;
}

function getIo() {
  return ioInstance;
}

async function closeSocket() {
  if (ioInstance) {
    await ioInstance.close();
    ioInstance = null;
  }
}

module.exports = {
  initializeSocket,
  getIo,
  closeSocket,
};
