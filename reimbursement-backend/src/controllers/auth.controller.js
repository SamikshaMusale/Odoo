const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, defaultCurrency } = req.body;
  const result = await authService.signup({ name, email, password, companyName, defaultCurrency });
  return ApiResponse.created(res, result, 'Company and admin account created successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return ApiResponse.success(res, result, 'Login successful');
});

module.exports = { signup, login };
