const express = require('express');
const permissionController = require('../controllers/permissionController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, permissionController.me); // chacun doit pouvoir lire ses propres permissions
router.get('/', requireAuth, requirePermission('manage_permissions'), permissionController.listAll);
router.patch('/', requireAuth, requirePermission('manage_permissions'), permissionController.update);

module.exports = router;