const mongoose = require('mongoose');

/**
 * Schema 1: Document
 * Represents compliance and operational business documents tracked for expiry.
 */
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    owner: {
      type: String,
      required: [true, 'Document owner is required'],
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Active', 'Expiring Soon', 'Expired'],
        message: '{VALUE} is not a supported status. Allowed: Active, Expiring Soon, Expired',
      },
      default: 'Active',
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;

