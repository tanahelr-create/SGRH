const express = require('express');
const multer = require('multer');
const personnelController = require('../controllers/personnelController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/me', requireAuth, requirePermission('view_profil'), personnelController.me);
router.post('/', requireAuth, requirePermission('create_personnel'), personnelController.create);
router.get('/export', requireAuth, requirePermission('view_personnel'), personnelController.exportExcel);
router.post('/import', requireAuth, requirePermission('create_personnel'), upload.single('file'), personnelController.importExcel);
router.get('/', requireAuth, requirePermission('view_personnel'), personnelController.list);
router.get('/sans-compte', requireAuth, requirePermission('send_registration_link'), personnelController.listWithoutAccount);
router.post('/:id/envoyer-lien', requireAuth, requirePermission('send_registration_link'), personnelController.sendRegistrationLink);

module.exports = router;