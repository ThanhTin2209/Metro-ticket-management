const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // e.g. L1-01
  location: {
     lat: Number,
     lng: Number
  },
  status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
  facilities: [{ type: String }], // Toilet, Elevator, ATM
  lines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Line' }]
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);
