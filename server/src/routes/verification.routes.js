const express = require('express');
const controller = require('../controllers/verificationController');
const { creerLimiteur } = require('../middlewares/rateLimit');

const router = express.Router();

// Volontairement publique : vérifie l'authenticité d'un avis via un jeton signé.
// Limitée par adresse IP (30 vérifications / 10 min) : un usage légitime en demande
// quelques-unes, des essais répétés sont bloqués.
const limiteur = creerLimiteur({
  fenetreMs: 10 * 60 * 1000,
  max: 30,
  message: 'Trop de vérifications depuis cette adresse. Veuillez réessayer dans quelques minutes.',
});
router.get('/avis/:token', limiteur, controller.verifierAvis);

module.exports = router;
