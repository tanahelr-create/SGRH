const express = require('express');
const controller = require('../controllers/parametreCarriereController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requirePermission('manage_parametres_carriere'), controller.list);
router.patch('/:cle', requireAuth, requirePermission('manage_parametres_carriere'), controller.update);

module.exports = router;