const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. Tuyến số 1
  code: { type: String, required: true, unique: true }, // e.g. L1
  color: { type: String, default: '#3B82F6' }, // Line color for UI
  status: { type: String, enum: ['active', 'maintenance', 'planned'], default: 'active' },
  stations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Station' }]
}, { timestamps: true });

module.exports = mongoose.model('Line', lineSchema);
