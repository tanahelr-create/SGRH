const invitationService = require('../services/invitationService');

async function inviteUser(req, res) {
  const { email, role, fonction, matricule } = req.body;
  if (!email || !role || !fonction || !matricule) {
    return res.status(400).json({ message: 'Email, rôle, fonction et matricule requis' });
  }
  if (!['PE', 'PAT'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

  try {
    const invitation = await invitationService.inviteUser(email, role, fonction, matricule, req.user?.id || null);
    return res.status(201).json({
      message: 'Invitation envoyée',
      invitation: { id: invitation.id, email: invitation.email, status: invitation.status },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getByToken(req, res) {
  try {
    const invitation = await invitationService.getInvitationByToken(req.params.token);
    return res.status(200).json({ email: invitation.email, role: invitation.role });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function submitForm(req, res) {
  try {
    const invitation = await invitationService.submitInvitationForm(req.params.token, req.body);
    return res.status(200).json({ message: 'Formulaire soumis, en attente de validation', invitation });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function listPending(req, res) {
  const invitations = await invitationService.listSubmittedInvitations();
  return res.status(200).json({ invitations });
}

async function confirm(req, res) {
  try {
    const user = await invitationService.confirmInvitation(req.params.id, req.body.fonction, req.body.typeContrat);
    return res.status(200).json({ message: 'Compte confirmé', user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function reject(req, res) {
  try {
    await invitationService.rejectInvitation(req.params.id);
    return res.status(200).json({ message: 'Invitation refusée' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { inviteUser, getByToken, submitForm, listPending, confirm, reject };