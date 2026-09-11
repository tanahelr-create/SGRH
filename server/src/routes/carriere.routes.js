const express = require('express');
const carriereController = require('../controllers/carriereController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', requireAuth, requirePermission('view_profil'), carriereController.getMine);
router.get('/echeances', requireAuth, requirePermission('manage_fonctions'), carriereController.echeances);
router.get('/:personnelId', requireAuth, requirePermission('manage_fonctions'), carriereController.getForPersonnel);
router.post('/:personnelId', requireAuth, requirePermission('manage_fonctions'), carriereController.addEvenement);

module.exports = router;