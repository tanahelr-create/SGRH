const express = require('express');
const otpController = require('../controllers/otpController');

const router = express.Router();

router.post('/request', otpController.request);
router.post('/verify', otpController.verify);

module.exports = router;