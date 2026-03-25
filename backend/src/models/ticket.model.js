const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
  origin: { type: String },
  destination: { type: String },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  usageHistory: [{ 
    stationCode: String, 
    time: { type: Date, default: Date.now },
    action: { type: String, enum: ['entry', 'exit'] }
  }]
}, { timestamps: true });

// Index for quick search

ticketSchema.index({ owner: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
