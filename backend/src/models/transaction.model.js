const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['topup', 'purchase', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  referenceId: { type: mongoose.Schema.Types.ObjectId } // e.g. ticketId or validationId
}, { timestamps: true });

transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
