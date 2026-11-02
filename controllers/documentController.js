const mongoose = require('mongoose');
const { Document, RenewalHistory } = require('../models');
const { initialDocuments, initialRenewalHistory } = require('../data/proxyData');

// In-memory fallback proxy store when MongoDB is unconfigured or offline
let memoryDocs = JSON.parse(JSON.stringify(initialDocuments));
let memoryHistory = JSON.parse(JSON.stringify(initialRenewalHistory));

const isMongoConnected = () => mongoose.connection.readyState === 1;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents
// Returns all documents sorted by expiryDate ASC (closest to expiry first).
// Supports optional ?status= filter.
// ─────────────────────────────────────────────────────────────────────────────
const getAllDocuments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const allowedStatuses = ['Active', 'Expiring Soon', 'Expired'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status filter. Allowed values: ${allowedStatuses.join(', ')}.`,
      });
    }

    if (isMongoConnected()) {
      const filter = status ? { status } : {};
      const documents = await Document.find(filter).sort({ expiryDate: 1 });
      return res.status(200).json({
        success: true,
        count: documents.length,
        data: documents,
        source: 'database',
      });
    }

    // In-memory proxy data fallback
    let docs = [...memoryDocs];
    if (status) {
      docs = docs.filter((d) => d.status === status);
    }
    docs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
      source: 'proxy',
      notice: 'Operating with proxy compliance data (MongoDB is unconfigured).',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id
// Returns a single document by ObjectId.
// ─────────────────────────────────────────────────────────────────────────────
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const doc = await Document.findById(id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: `No document found with id: ${id}`,
        });
      }
      return res.status(200).json({ success: true, data: doc });
    }

    // In-memory proxy data fallback
    const doc = memoryDocs.find((d) => d._id === id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${id}`,
      });
    }

    return res.status(200).json({ success: true, data: doc, source: 'proxy' });
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

    if (isMongoConnected()) {
      const newDoc = await Document.create({
        title,
        owner,
        expiryDate,
        status: status || 'Active',
        documentType,
      });

      return res.status(201).json({
        success: true,
        message: 'Document created successfully in database.',
        data: newDoc,
      });
    }

    // In-memory proxy fallback
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      title,
      owner,
      expiryDate: new Date(expiryDate).toISOString(),
      status: status || 'Active',
      documentType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDocs.push(newDoc);

    return res.status(201).json({
      success: true,
      message: 'Document registered successfully (proxy data store).',
      data: newDoc,
      source: 'proxy',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id
// Updates an existing document.
// ─────────────────────────────────────────────────────────────────────────────
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    if (isMongoConnected()) {
      const updated = await Document.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `No document found with id: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document updated successfully.',
        data: updated,
      });
    }

    // In-memory proxy fallback
    const index = memoryDocs.findIndex((d) => d._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${id}`,
      });
    }

    memoryDocs[index] = {
      ...memoryDocs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully (proxy data store).',
      data: memoryDocs[index],
      source: 'proxy',
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
    const { id } = req.params;

    if (isMongoConnected()) {
      const doc = await Document.findById(id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: `No document found with id: ${id}`,
        });
      }

      await RenewalHistory.deleteMany({ documentId: id });
      await doc.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Document and its associated renewal history deleted successfully.',
      });
    }

    // In-memory proxy fallback
    const initialLen = memoryDocs.length;
    memoryDocs = memoryDocs.filter((d) => d._id !== id);
    if (memoryDocs.length === initialLen) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${id}`,
      });
    }
    memoryHistory = memoryHistory.filter((h) => h.documentId !== id);

    return res.status(200).json({
      success: true,
      message: 'Document and audit history deleted from proxy store.',
      source: 'proxy',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/:id/renew
// Renews a document: updates its expiryDate + status, logs RenewalHistory.
// ─────────────────────────────────────────────────────────────────────────────
const renewDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newExpiryDate, completedBy } = req.body;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let newStatus = 'Active';
    if (new Date(newExpiryDate) <= now) {
      newStatus = 'Expired';
    } else if (new Date(newExpiryDate) <= thirtyDaysFromNow) {
      newStatus = 'Expiring Soon';
    }

    if (isMongoConnected()) {
      // Check if transactions are supported (replica set) or perform direct writes (standalone)
      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const doc = await Document.findById(id).session(session);
        if (!doc) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ success: false, message: `No document found with id: ${id}` });
        }

        const previousExpiryDate = doc.expiryDate;
        doc.expiryDate = newExpiryDate;
        doc.status = newStatus;
        await doc.save({ session });

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
          data: { document: doc, renewalHistory: historyEntry },
        });
      } catch (txnError) {
        // Fallback for standalone MongoDB without replica sets
        const doc = await Document.findById(id);
        if (!doc) {
          return res.status(404).json({ success: false, message: `No document found with id: ${id}` });
        }
        const previousExpiryDate = doc.expiryDate;
        doc.expiryDate = newExpiryDate;
        doc.status = newStatus;
        await doc.save();

        const historyEntry = await RenewalHistory.create({
          documentId: doc._id,
          previousExpiryDate,
          newExpiryDate,
          renewalDate: new Date(),
          completedBy,
        });

        return res.status(200).json({
          success: true,
          message: `Document renewed successfully. New status: ${newStatus}.`,
          data: { document: doc, renewalHistory: historyEntry },
        });
      }
    }

    // In-memory proxy fallback
    const doc = memoryDocs.find((d) => d._id === id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${id}`,
      });
    }

    const previousExpiryDate = doc.expiryDate;
    doc.expiryDate = new Date(newExpiryDate).toISOString();
    doc.status = newStatus;
    doc.updatedAt = new Date().toISOString();

    const historyEntry = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      documentId: doc._id,
      previousExpiryDate,
      newExpiryDate: doc.expiryDate,
      renewalDate: new Date().toISOString(),
      completedBy,
      createdAt: new Date().toISOString(),
    };
    memoryHistory.unshift(historyEntry);

    return res.status(200).json({
      success: true,
      message: `Document renewed successfully in proxy ledger. New status: ${newStatus}.`,
      data: { document: doc, renewalHistory: historyEntry },
      source: 'proxy',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id/history
// Returns renewal audit trail for a document, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getRenewalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const doc = await Document.findById(id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: `No document found with id: ${id}`,
        });
      }

      const history = await RenewalHistory.find({ documentId: id })
        .sort({ renewalDate: -1 })
        .populate('documentId', 'title owner documentType');

      return res.status(200).json({
        success: true,
        count: history.length,
        document: { id: doc._id, title: doc.title },
        data: history,
      });
    }

    // In-memory proxy fallback
    const doc = memoryDocs.find((d) => d._id === id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No document found with id: ${id}`,
      });
    }

    const history = memoryHistory
      .filter((h) => h.documentId === id)
      .sort((a, b) => new Date(b.renewalDate) - new Date(a.renewalDate))
      .map((h) => ({
        ...h,
        documentId: {
          _id: doc._id,
          title: doc.title,
          owner: doc.owner,
          documentType: doc.documentType,
        },
      }));

    return res.status(200).json({
      success: true,
      count: history.length,
      document: { id: doc._id, title: doc.title },
      data: history,
      source: 'proxy',
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
