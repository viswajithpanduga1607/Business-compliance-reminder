const express = require('express');
const router = express.Router();

const {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  renewDocument,
  getRenewalHistory,
} = require('../controllers/documentController');

const {
  validateCreateDocument,
  validateUpdateDocument,
  validateRenewDocument,
  validateObjectId,
} = require('../middleware/validators');

const { validate } = require('../middleware/errorHandler');

// ─── Document CRUD ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/documents
 * @desc    Retrieve all documents sorted by expiryDate ascending (closest first).
 *          Optional filter: ?status=Active|Expiring Soon|Expired
 * @access  Public
 */
router.get('/', getAllDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Retrieve a single document by its ObjectId.
 * @access  Public
 */
router.get('/:id', [validateObjectId('id'), validate], getDocumentById);

/**
 * @route   POST /api/documents
 * @desc    Create a new compliance document.
 * @access  Public
 * @body    { title, owner, expiryDate, status?, documentType }
 */
router.post('/', [...validateCreateDocument, validate], createDocument);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update an existing document (partial update supported).
 * @access  Public
 * @body    Any subset of { title, owner, expiryDate, status, documentType }
 */
router.put('/:id', [...validateUpdateDocument, validate], updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document and cascade-remove its renewal history.
 * @access  Public
 */
router.delete('/:id', [validateObjectId('id'), validate], deleteDocument);

// ─── Renewal & History ────────────────────────────────────────────────────────

/**
 * @route   POST /api/documents/:id/renew
 * @desc    Renew a document: updates expiryDate + auto-computes status,
 *          and atomically logs a RenewalHistory entry.
 * @access  Public
 * @body    { newExpiryDate, completedBy }
 */
router.post('/:id/renew', [...validateRenewDocument, validate], renewDocument);

/**
 * @route   GET /api/documents/:id/history
 * @desc    Retrieve the full renewal audit trail for a document (newest first).
 * @access  Public
 */
router.get('/:id/history', [validateObjectId('id'), validate], getRenewalHistory);

module.exports = router;

