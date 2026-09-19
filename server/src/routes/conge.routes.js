const express = require('express');
const multer = require('multer');
const congeController = require('../controllers/congeController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function uploadJustificatif(req, res, next) {
  upload.single('justificatif')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Le fichier ne doit pas dépasser 5 Mo.' });
    }
    return res.status(400).json({ message: 'Impossible de lire le fichier envoyé.' });
  });
}

const router = express.Router();

router.post('/', requireAuth, requirePermission('create_conge'), congeController.create);
router.get('/me', requireAuth, requirePermission('view_mes_conges'), congeController.myDemandes);
router.get('/pending', requireAuth, requirePermission('view_conges_admin'), congeController.pending);
router.get('/pending-equipe', requireAuth, congeController.pendingPourValidateur);
router.get('/recent', requireAuth, requirePermission('view_conges_admin'), congeController.recent);
router.get('/calendar', requireAuth, requirePermission('view_conges_admin'), congeController.calendar);
router.get('/:id', requireAuth, congeController.getOne);
router.get('/:id/justificatif', requireAuth, congeController.telechargerJustificatif);
router.post('/:id/justificatif', requireAuth, uploadJustificatif, congeController.uploadJustificatif);
router.post('/:id/review-intermediaire', requireAuth, congeController.reviewIntermediaire);
router.post('/:id/review', requireAuth, requirePermission('view_conges_admin'), congeController.review);

module.exports = router;