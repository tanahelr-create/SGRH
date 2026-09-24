const express = require('express');
const reclamationController = require('../controllers/reclamationController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, requirePermission('signaler_probleme'), reclamationController.signaler);
router.get('/me', requireAuth, requirePermission('signaler_probleme'), reclamationController.mesReclamations);
router.get('/', requireAuth, requirePermission('manage_reclamations'), reclamationController.toutes);
router.patch('/:id/traiter', requireAuth, requirePermission('manage_reclamations'), reclamationController.traiter);

module.exports = router;
