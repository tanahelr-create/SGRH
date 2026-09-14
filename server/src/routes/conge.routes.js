const express = require('express');
const congeController = require('../controllers/congeController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, requirePermission('create_conge'), congeController.create);
router.get('/me', requireAuth, requirePermission('view_mes_conges'), congeController.myDemandes);
router.get('/pending', requireAuth, requirePermission('view_conges_admin'), congeController.pending);
router.get('/pending-equipe', requireAuth, congeController.pendingPourValidateur);
router.get('/recent', requireAuth, requirePermission('view_conges_admin'), congeController.recent);
router.get('/calendar', requireAuth, requirePermission('view_conges_admin'), congeController.calendar);
router.get('/:id', requireAuth, congeController.getOne);
router.post('/:id/review-intermediaire', requireAuth, congeController.reviewIntermediaire);
router.post('/:id/review', requireAuth, requirePermission('view_conges_admin'), congeController.review);

module.exports = router;