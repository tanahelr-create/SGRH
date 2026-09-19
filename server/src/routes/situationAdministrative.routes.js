const express = require('express');
const multer = require('multer');
const controller = require('../controllers/situationAdministrativeController');
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

router.get('/types', requireAuth, controller.types);
router.get('/me', requireAuth, requirePermission('view_profil'), controller.getMine);
router.get('/:personnelId', requireAuth, requirePermission('manage_situations_administratives'), controller.getForPersonnel);
router.post('/:personnelId', requireAuth, requirePermission('manage_situations_administratives'), uploadJustificatif, controller.addSituation);
router.patch('/:id', requireAuth, requirePermission('manage_situations_administratives'), controller.updateSituation);
router.delete('/:id', requireAuth, requirePermission('manage_situations_administratives'), controller.deleteSituation);

module.exports = router;