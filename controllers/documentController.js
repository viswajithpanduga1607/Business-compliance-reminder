const { Document, RenewalHistory } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents
// Returns all documents sorted by expiryDate ASC (closest to expiry first).
// Supports optional ?status= filter to narrow results.
// ─────────────────────────────────────────────────────────────────────────────
const getAllDocuments = async (req, res, next) => {
  try {
    const filter = {};

    // Optional status filter query param (?status=Active)
    if (req.query.status) {
      const allowedStatuses = ['Active', 'Expiring Soon', 'Expired'];
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${allowedStatuses.join(', ')}.`,
        });
      }
      filter.status = req.query.status;
    }

    // Sort ascending by expiryDate → documents closest to expiry appear first
    const documents = await Document.find(filter).sort({ expiryDate: 1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id
// Returns a single document by its MongoDB ObjectId.
// ─────────────────────────────────────────────────────────────────────────────
const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents
// Creates a new compliance document.
// ─────────────────────────────────────────────────────────────────────────────
const createDocument = async (req, res, next) => {
  try {
    const { title, owner, expiryDate, status, documentType } = req.body;

    const newDoc = await Document.create({
      title,
      owner,
      expiryDate,
      status: status || 'Active',
      documentType,
    });

    return res.status(201).json({
      success: true,
      message: 'Document created successfully.',
      data: newDoc,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id
// Updates an existing document (partial update supported).
// ─────────────────────────────────────────────────────────────────────────────
const updateDocument = async (req, res, next) => {
  try {
    const allowedFields = ['title', 'owner', 'expiryDate', 'status', 'documentType'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const updated = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id
// Permanently removes a document and its associated renewal history.
// ─────────────────────────────────────────────────────────────────────────────
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${req.params.id}`,
      });
    }

    // Cascade-delete all renewal history entries linked to this document
    await RenewalHistory.deleteMany({ documentId: req.params.id });
    await doc.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Document and its associated renewal history deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/:id/renew
// Renews a document: updates its expiryDate + status, and atomically logs
// a new RenewalHistory entry. Both writes are performed inside a transaction
// to guarantee audit-trail integrity.
// ─────────────────────────────────────────────────────────────────────────────
const renewDocument = async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { newExpiryDate, completedBy } = req.body;

    // Fetch within session to lock the document
    const doc = await Document.findById(req.params.id).session(session);

    if (!doc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${req.params.id}`,
      });
    }

    const previousExpiryDate = doc.expiryDate;

    // Recompute status automatically based on new expiry date
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let newStatus = 'Active';
    if (new Date(newExpiryDate) <= now) {
      newStatus = 'Expired';
    } else if (new Date(newExpiryDate) <= thirtyDaysFromNow) {
      newStatus = 'Expiring Soon';
    }

    // Update document expiry and status
    doc.expiryDate = newExpiryDate;
    doc.status = newStatus;
    await doc.save({ session });

    // Log the renewal in history (atomic with the update above)
    const [historyEntry] = await RenewalHistory.create(
      [
        {
          documentId: doc._id,
          previousExpiryDate,
          newExpiryDate,
          renewalDate: new Date(),
          completedBy,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Document renewed successfully. New status: ${newStatus}.`,
      data: {
        document: doc,
        renewalHistory: historyEntry,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id/history
// Returns the full renewal audit trail for a document, most recent first.
// ─────────────────────────────────────────────────────────────────────────────
const getRenewalHistory = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${req.params.id}`,
      });
    }

    const history = await RenewalHistory.find({ documentId: req.params.id })
      .sort({ renewalDate: -1 })
      .populate('documentId', 'title owner documentType');

    return res.status(200).json({
      success: true,
      count: history.length,
      document: { id: doc._id, title: doc.title },
      data: history,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  renewDocument,
  getRenewalHistory,
};

