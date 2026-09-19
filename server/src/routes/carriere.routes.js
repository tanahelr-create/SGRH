const express = require('express');
const multer = require('multer');
const carriereController = require('../controllers/carriereController');
const alerteAvancementController = require('../controllers/alerteAvancementController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function uploadFile(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Le fichier ne doit pas dépasser 5 Mo.' });
      }
      return res.status(400).json({ message: 'Impossible de lire le fichier envoyé.' });
    });
  };
}

const router = express.Router();

router.get('/me', requireAuth, requirePermission('view_profil'), carriereController.getMine);
router.get('/echeances', requireAuth, requirePermission('manage_fonctions'), carriereController.echeances);
// Doit être déclaré AVANT '/:personnelId' : sinon Express matche "alertes-avancement" comme un personnelId.
router.get('/alertes-avancement', requireAuth, requirePermission('manage_fonctions'), alerteAvancementController.list);
router.get('/:personnelId', requireAuth, requirePermission('manage_fonctions'), carriereController.getForPersonnel);
router.post('/:personnelId', requireAuth, requirePermission('manage_fonctions'), uploadFile('justificatif'), carriereController.addEvenement);
router.post('/:personnelId/diplomes', requireAuth, requirePermission('manage_fonctions'), uploadFile('document'), carriereController.addDiplome);
router.get('/evenements/:id/justificatif', requireAuth, carriereController.telechargerJustificatifEvenement);
router.patch('/evenements/:id', requireAuth, requirePermission('manage_fonctions'), uploadFile('justificatif'), carriereController.updateEvenement);
router.delete('/evenements/:id', requireAuth, requirePermission('delete_carriere_evenement'), carriereController.deleteEvenement);
router.get('/diplomes/:id/document', requireAuth, carriereController.telechargerDocumentDiplome);
router.delete('/diplomes/:id', requireAuth, requirePermission('manage_fonctions'), carriereController.deleteDiplome);

router.patch('/alertes-avancement/:id/traiter', requireAuth, requirePermission('manage_fonctions'), alerteAvancementController.traiterEchelon);
router.patch('/alertes-avancement/:id/ignorer', requireAuth, requirePermission('manage_fonctions'), alerteAvancementController.ignorer);

module.exports = router;