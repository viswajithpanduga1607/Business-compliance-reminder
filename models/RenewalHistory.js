const mongoose = require('mongoose');

/**
 * Schema 2: RenewalHistory
 * Permanent audit trail ledger for document renewals.
 */
const renewalHistorySchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document reference ID is required'],
    },
    previousExpiryDate: {
      type: Date,
      required: [true, 'Previous expiry date is required'],
    },
    newExpiryDate: {
      type: Date,
      required: [true, 'New expiry date is required'],
    },
    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required'],
      default: Date.now,
    },
    completedBy: {
      type: String,
      required: [true, 'Completed by is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const RenewalHistory = mongoose.model('RenewalHistory', renewalHistorySchema);

module.exports = RenewalHistory;

