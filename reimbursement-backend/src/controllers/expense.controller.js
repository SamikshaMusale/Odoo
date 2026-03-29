const expenseService = require('../services/expense.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createExpense = asyncHandler(async (req, res) => {
  const { amount, currency, category, description, date } = req.body;
  const expense = await expenseService.createExpense({
    amount,
    currency,
    category,
    description,
    date,
    userId: req.user.id,
    companyId: req.user.companyId,
  });
  return ApiResponse.created(res, expense, 'Expense submitted successfully');
});

const getMyExpenses = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await expenseService.getMyExpenses(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
  });
  return ApiResponse.success(res, result);
});

const getTeamExpenses = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await expenseService.getTeamExpenses(req.user.id, req.user.companyId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
  });
  return ApiResponse.success(res, result);
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(
    req.params.id,
    req.user.id,
    req.user.role,
    req.user.companyId
  );
  return ApiResponse.success(res, expense);
});

module.exports = { createExpense, getMyExpenses, getTeamExpenses, getExpenseById };
