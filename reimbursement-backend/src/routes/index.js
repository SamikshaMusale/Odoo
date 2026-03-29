const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const expenseRoutes = require('./expense.routes');
const approvalRoutes = require('./approval.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expenses', expenseRoutes);
router.use('/approvals', approvalRoutes);

module.exports = router;
