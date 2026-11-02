const { body, param } = require('express-validator');

/**
 * Shared validator: MongoDB ObjectId in route params.
 */
const validateObjectId = (field = 'id') =>
  param(field)
    .isMongoId()
    .withMessage(`'${field}' must be a valid MongoDB ObjectId.`);

/**
 * Validators for Document CREATE (POST /api/documents)
 */
const validateCreateDocument = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required.')
    .isLength({ min: 2, max: 200 })
    .withMessage('title must be between 2 and 200 characters.'),

  body('owner')
    .trim()
    .notEmpty()
    .withMessage('owner is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('owner must be between 2 and 150 characters.'),

  body('expiryDate')
    .notEmpty()
    .withMessage('expiryDate is required.')
    .isISO8601()
    .withMessage('expiryDate must be a valid ISO 8601 date (e.g. 2027-06-30 or 2027-06-30T00:00:00Z).')
    .toDate(),

  body('status')
    .optional()
    .trim()
    .isIn(['Active', 'Expiring Soon', 'Expired'])
    .withMessage("status must be one of: 'Active', 'Expiring Soon', 'Expired'."),

  body('documentType')
    .trim()
    .notEmpty()
    .withMessage('documentType is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('documentType must be between 2 and 100 characters.'),
];

/**
 * Validators for Document UPDATE (PUT /api/documents/:id)
 * All fields are optional on update, but validated strictly when provided.
 */
const validateUpdateDocument = [
  validateObjectId('id'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('title cannot be blank.')
    .isLength({ min: 2, max: 200 })
    .withMessage('title must be between 2 and 200 characters.'),

  body('owner')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('owner cannot be blank.')
    .isLength({ min: 2, max: 150 })
    .withMessage('owner must be between 2 and 150 characters.'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('expiryDate must be a valid ISO 8601 date.')
    .toDate(),

  body('status')
    .optional()
    .trim()
    .isIn(['Active', 'Expiring Soon', 'Expired'])
    .withMessage("status must be one of: 'Active', 'Expiring Soon', 'Expired'."),

  body('documentType')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('documentType cannot be blank.')
    .isLength({ min: 2, max: 100 })
    .withMessage('documentType must be between 2 and 100 characters.'),
];

/**
 * Validators for Document RENEWAL (POST /api/documents/:id/renew)
 */
const validateRenewDocument = [
  validateObjectId('id'),

  body('newExpiryDate')
    .notEmpty()
    .withMessage('newExpiryDate is required.')
    .isISO8601()
    .withMessage('newExpiryDate must be a valid ISO 8601 date.')
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('newExpiryDate must be a future date.');
      }
      return true;
    }),

  body('completedBy')
    .trim()
    .notEmpty()
    .withMessage('completedBy is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('completedBy must be between 2 and 150 characters.'),
];

module.exports = {
  validateObjectId,
  validateCreateDocument,
  validateUpdateDocument,
  validateRenewDocument,
};

