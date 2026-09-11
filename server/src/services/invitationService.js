const bcrypt = require('bcryptjs');
const invitationRepository = require('../repositories/invitationRepository');
const userRepository = require('../repositories/userRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const { generateToken } = require('../utils/token');
const { sendInvitationEmail, sendAccountConfirmedEmail } = require('../config/mailer');

async function inviteUser(email, role, fonction, matricule, sentBy) {
  const existing = await invitationRepository.findPendingByEmail(email);
  if (existing) throw new Error('Une invitation est déjà en attente pour cet email');

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await invitationRepository.create({ email, role, fonction, matricule, token, sentBy, expiresAt });

  const invitationLink = `${process.env.FRONTEND_URL}/creer-compte?token=${token}`;
  await sendInvitationEmail(email, invitationLink);

  await activityLogRepository.create(sentBy, 'invitation_envoyee', `Invitation envoyée à ${email} (${role})`);

  return invitation;
}

async function getInvitationByToken(token) {
  const invitation = await invitationRepository.findByToken(token);
  if (!invitation) throw new Error('Invitation introuvable');
  if (invitation.status !== 'envoyee') throw new Error('Cette invitation a déjà été utilisée');
  if (new Date(invitation.expires_at) < new Date()) throw new Error('Ce lien a expiré');
  return invitation;
}

async function submitInvitationForm(token, formData) {
  const invitation = await getInvitationByToken(token);
  return invitationRepository.markAsSubmitted(invitation.id, formData);
}

async function listSubmittedInvitations() {
  return invitationRepository.findAllSubmitted();
}

async function confirmInvitation(id, fonctionOverride, typeContrat) {
  const invitation = await invitationRepository.findById(id);
  if (!invitation || invitation.status !== 'soumise') {
    throw new Error('Invitation introuvable ou déjà traitée');
  }

  const fonction = fonctionOverride || invitation.fonction;
  if (!fonction) throw new Error('La fonction est requise pour confirmer ce compte');
  if (!typeContrat) throw new Error('Le type de contrat est requis pour confirmer ce compte');
  if (!invitation.matricule) throw new Error('Le matricule est manquant sur cette invitation');

  const { password, nom, prenom } = invitation.submitted_data;
  const passwordHash = await bcrypt.hash(password, 10);

  const personnel = await personnelRepository.create({
    matricule: invitation.matricule,
    nom,
    prenom,
    email: invitation.email,
    fonction,
    typeContrat,
  });

  const createdUser = await userRepository.create({
    role: invitation.role,
    email: null,
    passwordHash,
    personnelId: personnel.id,
  });

  await invitationRepository.markAsConfirmed(id, createdUser.id);
  await sendAccountConfirmedEmail(invitation.email);

  await activityLogRepository.create(null, 'compte_confirme', `Compte confirmé pour ${invitation.email} (${invitation.role})`);

  return userRepository.findById(createdUser.id);
}

async function rejectInvitation(id) {
  const invitation = await invitationRepository.findById(id);
  if (!invitation || invitation.status !== 'soumise') {
    throw new Error('Invitation introuvable ou déjà traitée');
  }
  const result = await invitationRepository.markAsRejected(id);
  await activityLogRepository.create(null, 'compte_refuse', `Invitation refusée pour ${invitation.email}`);
  return result;
}

module.exports = {
  inviteUser, getInvitationByToken, submitInvitationForm,
  listSubmittedInvitations, confirmInvitation, rejectInvitation,
};