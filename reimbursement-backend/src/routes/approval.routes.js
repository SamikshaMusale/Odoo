const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveStep, rejectStep } = require('../controllers/approval.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { approvalActionRules, validate } = require('../middleware/validators');

// All approval routes require MANAGER or ADMIN role
router.use(authenticate, authorize('MANAGER', 'ADMIN'));

router.get('/pending', getPendingApprovals);
router.post('/:id/approve', approvalActionRules, validate, approveStep);
router.post('/:id/reject', approvalActionRules, validate, rejectStep);

module.exports = router;
