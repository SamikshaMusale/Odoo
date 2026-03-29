const express = require('express');
const router = express.Router();
const {
  createExpense,
  getMyExpenses,
  getTeamExpenses,
  getExpenseById,
} = require('../controllers/expense.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createExpenseRules, validate } = require('../middleware/validators');

// All expense routes require authentication
router.use(authenticate);

// Employee/Manager/Admin: submit expense
router.post('/', authorize('EMPLOYEE', 'MANAGER', 'ADMIN'), createExpenseRules, validate, createExpense);

// Employee: view own expenses
router.get('/my', getMyExpenses);

// Manager/Admin: view team expenses
router.get('/team', authorize('MANAGER', 'ADMIN'), getTeamExpenses);

// Any authenticated user: view expense detail (service handles access control)
router.get('/:id', getExpenseById);

module.exports = router;
