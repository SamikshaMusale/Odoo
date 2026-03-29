const approvalService = require('../services/approval.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getPendingApprovals = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await approvalService.getPendingApprovals(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  return ApiResponse.success(res, result);
});

const approveStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const result = await approvalService.approve(id, req.user.id, comment);
  return ApiResponse.success(res, result, 'Expense approved');
});

const rejectStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const result = await approvalService.reject(id, req.user.id, comment);
  return ApiResponse.success(res, result, 'Expense rejected');
});

module.exports = { getPendingApprovals, approveStep, rejectStep };
