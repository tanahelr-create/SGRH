const express = require('express');
const congeController = require('../controllers/congeController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, requirePermission('create_conge'), congeController.create);
router.get('/me', requireAuth, requirePermission('view_mes_conges'), congeController.myDemandes);
router.get('/pending', requireAuth, requirePermission('view_conges_admin'), congeController.pending);
router.get('/recent', requireAuth, requirePermission('view_conges_admin'), congeController.recent);
router.get('/calendar', requireAuth, requirePermission('view_conges_admin'), congeController.calendar);
router.get('/:id', requireAuth, congeController.getOne); // sécurité déjà assurée par vérification de propriété dans le service
router.post('/:id/review', requireAuth, requirePermission('view_conges_admin'), congeController.review);

module.exports = router;