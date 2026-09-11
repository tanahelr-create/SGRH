const express = require('express');
const statsController = require('../controllers/statsController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/admin-dashboard', requireAuth, requirePermission('view_dashboard_admin'), statsController.adminDashboard);

module.exports = router;