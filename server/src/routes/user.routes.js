const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requirePermission('send_notification'), userController.list);
router.get('/personnel', requireAuth, requirePermission('view_personnel'), userController.personnel);
router.patch('/:id/fonction', requireAuth, requirePermission('manage_fonctions'), userController.changeFonction);
router.get('/:id/fonction-history', requireAuth, requirePermission('manage_fonctions'), userController.fonctionHistory);

module.exports = router;