const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketCode: { type: String, default: null }, // Optional: if violation involves a specific ticket
  violatorName: { type: String, default: 'Chưa xác định' },
  violatorContact: { type: String, default: null },
  type: { 
    type: String, 
    enum: ['NO_TICKET', 'EXPIRED_TICKET', 'SMOKING', 'LITTERING', 'SECURITY_BREACH', 'OTHER'],
    required: true 
  },
  severity: {
    type: String,
    enum: ['LIGHT', 'MODERATE', 'SEVERE'],
    default: 'MODERATE'
  },
  location: { type: String, required: true }, // e.g. Tàu L1-05
  description: { type: String, required: true },
  fineAmount: { type: Number, default: 0 },
  evidenceImages: [{ type: String }], // Array of image URLs
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'CANCELLED'],
    default: 'PENDING'
  }
}, { timestamps: true });

violationSchema.index({ inspectorId: 1 });
violationSchema.index({ ticketCode: 1 });
violationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Violation', violationSchema);
