const express = require('express');
const invitationController = require('../controllers/invitationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes fixes AVANT les routes à paramètre — règle à ne plus jamais oublier
router.post('/', requireAuth, requireRole('ADMIN_RH'), invitationController.inviteUser);
router.get('/pending', requireAuth, requireRole('ADMIN_RH'), invitationController.listPending);

router.get('/:token', invitationController.getByToken);
router.post('/:token/submit', invitationController.submitForm);
router.post('/:id/confirm', requireAuth, requireRole('ADMIN_RH'), invitationController.confirm);
router.post('/:id/reject', requireAuth, requireRole('ADMIN_RH'), invitationController.reject);

module.exports = router;