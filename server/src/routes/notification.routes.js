const express = require('express');
const notificationController = require('../controllers/notificationController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, requirePermission('send_notification'), notificationController.send);
router.get('/me', requireAuth, requirePermission('view_notifications'), notificationController.myNotifications);
router.post('/read-all', requireAuth, requirePermission('view_notifications'), notificationController.markAllRead);
router.post('/:id/read', requireAuth, requirePermission('view_notifications'), notificationController.markRead);

module.exports = router;