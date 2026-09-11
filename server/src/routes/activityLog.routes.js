const express = require('express');
const activityLogController = require('../controllers/activityLogController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requirePermission('view_historique'), activityLogController.list);

module.exports = router;