const express = require('express');
const multer = require('multer');
const contratController = require('../controllers/contratController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function uploadPdf(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Le fichier ne doit pas dépasser 10 Mo.' });
      }
      return res.status(400).json({ message: 'Impossible de lire le fichier envoyé.' });
    });
  };
}

const router = express.Router();

router.get('/me', requireAuth, requirePermission('view_profil'), contratController.mesContrats);
router.get('/personnel/:personnelId', requireAuth, requirePermission('manage_fonctions'), contratController.historiquePersonnel);
router.post('/personnel/:personnelId', requireAuth, requirePermission('manage_fonctions'), uploadPdf('fichier'), contratController.importer);
router.post('/personnel/:personnelId/:contratId/renouveler', requireAuth, requirePermission('manage_fonctions'), uploadPdf('fichier'), contratController.finaliserRenouvellement);
router.post('/:contratId/documents', requireAuth, requirePermission('manage_fonctions'), uploadPdf('fichier'), contratController.ajouterDocument);
router.post('/:contratId/decision', requireAuth, requirePermission('manage_fonctions'), contratController.marquerDecision);
router.get('/documents/:documentId/fichier', requireAuth, contratController.telechargerDocument);

module.exports = router;