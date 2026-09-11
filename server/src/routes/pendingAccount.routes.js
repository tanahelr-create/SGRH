const express = require('express');
const pendingAccountController = require('../controllers/pendingAccountController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requirePermission('view_pending_accounts'), pendingAccountController.list);
router.post('/:id/approve', requireAuth, requirePermission('view_pending_accounts'), pendingAccountController.approve);
router.post('/:id/reject', requireAuth, requirePermission('view_pending_accounts'), pendingAccountController.reject);

module.exports = router;