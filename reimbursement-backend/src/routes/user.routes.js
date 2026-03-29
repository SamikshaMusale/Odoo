const express = require('express');
const router = express.Router();
const { createUser, assignManager, listUsers, updateUserRole, getCurrentUser } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createUserRules, assignManagerRules, updateUserRoleRules, validate } = require('../middleware/validators');

// All user routes require authentication
router.use(authenticate);

// Get current user (any authenticated user)
router.get('/me', getCurrentUser);

// Admin-only routes
router.post('/', authorize('ADMIN'), createUserRules, validate, createUser);
router.get('/', authorize('ADMIN'), listUsers);
router.patch('/:userId/assign-manager', authorize('ADMIN'), assignManagerRules, validate, assignManager);
router.patch('/:userId/role', authorize('ADMIN'), updateUserRoleRules, validate, updateUserRole);

module.exports = router;
