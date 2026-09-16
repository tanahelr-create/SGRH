const express = require('express');
const organisationController = require('../controllers/organisationController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/directions', requireAuth, organisationController.directions);
router.get('/services', requireAuth, organisationController.services);

module.exports = router;