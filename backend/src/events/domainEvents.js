const EventEmitter = require("events");

const domainEvents = new EventEmitter();

const DOMAIN_EVENTS = {
  TICKET_ENTRY_VALIDATED: "ticket.entry.validated",
  TICKET_MANUAL_INSPECTION_CREATED: "ticket.manualInspection.created",
  REPORT_CREATED: "report.created",
  REPORT_STATUS_CHANGED: "report.status.changed",
  METRO_INCIDENT_REPORTED: "metro.incident.reported",
  METRO_INCIDENT_RESOLVED: "metro.incident.resolved",
};

module.exports = {
  domainEvents,
  DOMAIN_EVENTS,
};
