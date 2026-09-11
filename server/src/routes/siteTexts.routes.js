const express = require('express');
const siteTextsController = require('../controllers/siteTextsController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', siteTextsController.getAll); // public — nécessaire dès le login
router.post('/ensure-default', siteTextsController.ensureDefault); // public — appelé automatiquement par chaque composant
router.patch('/', requireAuth, requirePermission('manage_site_texts'), siteTextsController.update);

module.exports = router;