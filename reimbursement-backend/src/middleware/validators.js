const { body, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Run validation and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return ApiResponse.badRequest(res, 'Validation failed', errors.array());
  }

  next();
};

// ─── Auth Validators ─────────────────────────────────────

const signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
];

const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── User Validators ─────────────────────────────────────

const createUserRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .isIn(['MANAGER', 'EMPLOYEE'])
    .withMessage('Role must be MANAGER or EMPLOYEE'),

  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Manager ID must be a valid UUID'),
];

const assignManagerRules = [
  body('managerId')
    .isUUID()
    .withMessage('Manager ID must be a valid UUID'),
];

// ─── Expense Validators ──────────────────────────────────

const createExpenseRules = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('description')
    .optional()
    .trim(),

  body('date')
    .isISO8601()
    .withMessage('Valid date is required (ISO 8601)'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
];

// ─── Approval Validators ────────────────────────────────

const approvalActionRules = [
  body('comment')
    .optional()
    .trim(),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  createUserRules,
  assignManagerRules,
  createExpenseRules,
  approvalActionRules,
};