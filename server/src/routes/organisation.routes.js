const express = require('express');
const organisationController = require('../controllers/organisationController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/directions', requireAuth, organisationController.directions);
router.get('/services', requireAuth, organisationController.services);

router.post('/directions', requireAuth, requirePermission('manage_organisation'), organisationController.createDirection);
router.delete('/directions/:id', requireAuth, requirePermission('manage_organisation'), organisationController.deleteDirection);
router.post('/services', requireAuth, requirePermission('manage_organisation'), organisationController.createService);
router.delete('/services/:id', requireAuth, requirePermission('manage_organisation'), organisationController.deleteService);

module.exports = router;
