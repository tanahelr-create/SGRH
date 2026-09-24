const express = require('express');
const corbeilleController = require('../controllers/corbeilleController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requirePermission('manage_corbeille'), corbeilleController.list);
// Déclarée avant "/:id" : sinon ":id" capterait "/vider" (id = "vider").
router.delete('/vider', requireAuth, requirePermission('manage_corbeille'), corbeilleController.empty);
router.post('/:id/restaurer', requireAuth, requirePermission('manage_corbeille'), corbeilleController.restore);
router.delete('/:id', requireAuth, requirePermission('manage_corbeille'), corbeilleController.remove);

module.exports = router;