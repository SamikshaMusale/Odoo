const express = require('express');
const router = express.Router();
const { createUser, assignManager, listUsers } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createUserRules, assignManagerRules, validate } = require('../middleware/validators');

// All user routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.post('/', createUserRules, validate, createUser);
router.get('/', listUsers);
router.patch('/:userId/assign-manager', assignManagerRules, validate, assignManager);

module.exports = router;
