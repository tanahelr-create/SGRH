const express = require('express');
const siteSettingsController = require('../controllers/siteSettingsController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', siteSettingsController.get); // public, volontairement sans requireAuth — nécessaire dès la page de login
router.patch('/', requireAuth, requirePermission('manage_site_settings'), siteSettingsController.update);

module.exports = router;