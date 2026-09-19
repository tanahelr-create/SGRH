const express = require('express');
const controller = require('../controllers/grilleIndiciaireController');
const { requireAuth, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lecture large (view_profil) : un agent doit pouvoir comprendre son propre indice.
router.get('/grilles', requireAuth, requirePermission('view_profil'), controller.listGrilles);
router.get('/grilles/:id', requireAuth, requirePermission('view_profil'), controller.getGrille);
router.get('/recherche', requireAuth, requirePermission('view_profil'), controller.rechercher);
router.get('/resolve', requireAuth, requirePermission('manage_fonctions'), controller.resolve);
router.post('/grilles/:id/lignes', requireAuth, requirePermission('manage_parametres_carriere'), controller.ajouterLigne);

module.exports = router;
