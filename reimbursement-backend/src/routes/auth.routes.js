const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/auth.controller');
const { signupRules, loginRules, validate } = require('../middleware/validators');

router.post('/register', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);

module.exports = router;