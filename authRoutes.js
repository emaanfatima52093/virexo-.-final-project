
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/me', auth.me);
router.get('/users', auth.listUsers);
router.patch('/providers/:id/verify', auth.verifyProvider);
module.exports = router;
