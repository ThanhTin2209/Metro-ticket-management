const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterRole: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['EQUIPMENT_FAILURE', 'EMERGENCY', 'SECURITY', 'WEATHER', 'OTHER'],
    required: true 
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  location: { type: String, required: true }, // e.g. Ga Bến Thành, Tàu L1-05
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

incidentSchema.index({ status: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
