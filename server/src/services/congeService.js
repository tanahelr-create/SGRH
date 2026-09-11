const congeRepository = require('../repositories/congeRepository');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function createDemande(userId, { typeConge, dateDebut, dateFin, motif }) {
  if (new Date(dateFin) < new Date(dateDebut)) {
    throw new Error('La date de fin doit être après la date de début');
  }

  const demande = await congeRepository.create({ userId, typeConge, dateDebut, dateFin, motif });

  const admins = await userRepository.listActive({ role: 'ADMIN_RH' });
  for (const admin of admins) {
    await notificationRepository.create({
      senderId: userId,
      recipientId: admin.id,
      title: 'Nouvelle demande de congé',
      message: `Une demande de "${typeConge}" a été soumise.`,
      type: 'conge',
    });
  }

  await activityLogRepository.create(userId, 'conge_demande', `Demande de congé "${typeConge}" soumise`);

  return demande;
}

async function getMyDemandes(userId) {
  return congeRepository.findByUser(userId);
}

async function getPendingDemandes() {
  return congeRepository.findPending();
}

async function reviewDemande(id, decision, reviewedBy, avisChefService) {
  if (!['approuvee', 'refusee'].includes(decision)) {
    throw new Error('Décision invalide');
  }

  const demande = await congeRepository.findById(id);
  if (!demande || demande.status !== 'en_attente') {
    throw new Error('Demande introuvable ou déjà traitée');
  }

  const updated = await congeRepository.updateStatus(id, decision, reviewedBy, avisChefService);

  await notificationRepository.create({
    senderId: reviewedBy,
    recipientId: demande.user_id,
    title: decision === 'approuvee' ? 'Congé approuvé' : 'Congé refusé',
    message: `Votre demande de "${demande.type_conge}" du ${demande.date_debut} au ${demande.date_fin} a été ${decision === 'approuvee' ? 'approuvée' : 'refusée'}.`,
    type: 'conge',
  });

  await activityLogRepository.create(reviewedBy, 'conge_traite', `Demande #${id} ${decision === 'approuvee' ? 'approuvée' : 'refusée'}`);

  return updated;
}

async function getRecentDemandes(limit) {
  return congeRepository.findRecent(limit);
}

async function getCalendarDemandes(year, month) {
  return congeRepository.findForMonth(year, month);
}

async function getDemandeDetails(id, requestingUser) {
  const demande = await congeRepository.findByIdWithDetails(id);
  if (!demande) throw new Error('Demande introuvable');

  const isOwner = demande.user_id === requestingUser.id;
  const isAdmin = requestingUser.role === 'ADMIN_RH';
  if (!isOwner && !isAdmin) throw new Error('Accès refusé à cette demande');

  return demande;
}

module.exports = {
  createDemande, getMyDemandes, getPendingDemandes, reviewDemande,
  getRecentDemandes, getCalendarDemandes, getDemandeDetails,
};