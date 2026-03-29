const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, managerId } = req.body;
  const user = await userService.createUser({
    name,
    email,
    password,
    role,
    managerId,
    companyId: req.user.companyId,
  });
  return ApiResponse.created(res, user, `${role} created successfully`);
});

const assignManager = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { managerId } = req.body;
  const user = await userService.assignManager({
    userId,
    managerId,
    companyId: req.user.companyId,
  });
  return ApiResponse.success(res, user, 'Manager assigned successfully');
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.user.companyId);
  return ApiResponse.success(res, users);
});

module.exports = { createUser, assignManager, listUsers };
