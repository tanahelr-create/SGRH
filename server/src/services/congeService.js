const congeRepository = require('../repositories/congeRepository');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

const JUSTIFICATIF_REQUIS_VALIDATION = ['Congé de maladie', 'Congé de maternité'];

function nombreDeJours(dateDebut, dateFin) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diffMs = fin - debut;
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusif
}

async function determineValidateur(userId, personnel) {
  if (personnel.service) {
    const chefId = await personnelRepository.findChefDeServiceUser(personnel.service, userId);
    if (chefId) return { validateurId: chefId, decisionIntermediaire: 'en_attente' };
  }
  if (personnel.direction) {
    const responsableId = await personnelRepository.findResponsableDirectionUser(personnel.direction, userId);
    if (responsableId) return { validateurId: responsableId, decisionIntermediaire: 'en_attente' };
  }
  return { validateurId: null, decisionIntermediaire: 'non_requise' };
}

async function createDemande(userId, { typeConge, dateDebut, dateFin, motif, lieuJouissance, dateRepriseService, remplacant }) {
  if (new Date(dateFin) < new Date(dateDebut)) {
    throw new Error('La date de fin doit être après la date de début');
  }

  const user = await userRepository.findById(userId);
  if (!user || !user.personnel_id) {
    throw new Error('Aucune fiche personnel associée à ce compte');
  }

  await personnelRepository.rechargeAnnuelleSiNecessaire(user.personnel_id);

  const jours = nombreDeJours(dateDebut, dateFin);

  if (typeConge === 'Congé annuel') {
    const nbDemandesCetteAnnee = await congeRepository.countCongesAnnuelCetteAnnee(userId);
    if (nbDemandesCetteAnnee === 0 && jours < 15) {
      throw new Error("La première demande de congé annuel de l'année doit être d'au moins 15 jours");
    }

    const solde = await personnelRepository.getSolde(user.personnel_id);
    if (jours > solde) {
      throw new Error(`Solde insuffisant : il vous reste ${solde} jour(s) de congé annuel`);
    }
  }

  if (typeConge === 'Congé de paternité' && jours > 15) {
    throw new Error('Le congé de paternité ne peut pas dépasser 15 jours');
  }

  const { validateurId, decisionIntermediaire } = await determineValidateur(userId, user);

  const demande = await congeRepository.create({
    userId, typeConge, dateDebut, dateFin, motif, lieuJouissance, dateRepriseService, remplacant,
  });

  await congeRepository.setValidateur(demande.id, validateurId, decisionIntermediaire);

  if (typeConge === 'Congé annuel') {
    await personnelRepository.debiterSolde(user.personnel_id, jours);
  }

  if (validateurId) {
    await notificationRepository.create({
      senderId: userId,
      recipientId: validateurId,
      title: 'Nouvelle demande de congé (votre équipe)',
      message: `Une demande de "${typeConge}" de ${user.prenom} ${user.nom} attend votre avis.`,
      type: 'conge',
    });
  } else {
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
  }

  await activityLogRepository.create(userId, 'conge_demande', `Demande de "${typeConge}" soumise (${jours} jour(s))`);

  return demande;
}

async function uploadJustificatif(demandeId, userId, { filename, path }) {
  const demande = await congeRepository.findById(demandeId);
  if (!demande) throw new Error('Demande introuvable');
  if (demande.user_id !== userId) throw new Error('Vous ne pouvez pas modifier cette demande');

  const updated = await congeRepository.setJustificatif(demandeId, filename, path);
  await activityLogRepository.create(userId, 'conge_justificatif_ajoute', `Justificatif ajouté à la demande #${demandeId}`);
  return updated;
}

async function getMyDemandes(userId) {
  return congeRepository.findByUser(userId);
}

async function getPendingDemandes() {
  return congeRepository.findPending();
}

async function getPendingForValidateur(validateurUserId) {
  return congeRepository.findPendingForValidateur(validateurUserId);
}

async function reviewIntermediaire(id, decision, validateurUserId, avis) {
  if (!['approuvee', 'refusee'].includes(decision)) {
    throw new Error('Décision invalide');
  }
  const demande = await congeRepository.findById(id);
  if (!demande) throw new Error('Demande introuvable');
  if (demande.validateur_id !== validateurUserId) {
    throw new Error("Vous n'êtes pas le validateur assigné à cette demande");
  }
  if (demande.decision_intermediaire !== 'en_attente') {
    throw new Error('Cette demande a déjà été traitée à ce niveau');
  }

  const updated = await congeRepository.setDecisionIntermediaire(id, decision, avis);

  if (decision === 'refusee') {
    await congeRepository.updateStatus(id, 'refusee', null, avis);

    if (demande.type_conge === 'Congé annuel') {
      const requester = await userRepository.findById(demande.user_id);
      if (requester?.personnel_id) {
        const jours = nombreDeJours(demande.date_debut, demande.date_fin);
        await personnelRepository.crediterSolde(requester.personnel_id, jours);
      }
    }

    await notificationRepository.create({
      senderId: validateurUserId,
      recipientId: demande.user_id,
      title: 'Congé refusé',
      message: `Votre demande de "${demande.type_conge}" a été refusée par votre responsable direct.`,
      type: 'conge',
    });
  } else {
    const admins = await userRepository.listActive({ role: 'ADMIN_RH' });
    for (const admin of admins) {
      await notificationRepository.create({
        senderId: validateurUserId,
        recipientId: admin.id,
        title: 'Demande de congé à valider',
        message: `Une demande de "${demande.type_conge}" a été approuvée par le responsable direct, en attente de votre décision finale.`,
        type: 'conge',
      });
    }
  }

  await activityLogRepository.create(validateurUserId, 'conge_avis_intermediaire', `Demande #${id} : avis intermédiaire "${decision}"`);
  return updated;
}

async function reviewDemande(id, decision, reviewedBy, avisChefService) {
  if (!['approuvee', 'refusee'].includes(decision)) {
    throw new Error('Décision invalide');
  }

  const demande = await congeRepository.findById(id);
  if (!demande || demande.status !== 'en_attente') {
    throw new Error('Demande introuvable ou déjà traitée');
  }
  if (demande.decision_intermediaire === 'en_attente') {
    throw new Error("Cette demande attend encore l'avis du responsable direct");
  }
  if (decision === 'approuvee' && JUSTIFICATIF_REQUIS_VALIDATION.includes(demande.type_conge) && !demande.justificatif_path) {
    throw new Error('Un justificatif est requis avant de valider ce type de congé');
  }

  const updated = await congeRepository.updateStatus(id, decision, reviewedBy, avisChefService);

  if (decision === 'refusee' && demande.type_conge === 'Congé annuel') {
    const requester = await userRepository.findById(demande.user_id);
    if (requester?.personnel_id) {
      const jours = nombreDeJours(demande.date_debut, demande.date_fin);
      await personnelRepository.crediterSolde(requester.personnel_id, jours);
    }
  }

  await notificationRepository.create({
    senderId: reviewedBy,
    recipientId: demande.user_id,
    title: decision === 'approuvee' ? 'Congé approuvé' : 'Congé refusé',
    message: `Votre demande de "${demande.type_conge}" du ${demande.date_debut} au ${demande.date_fin} a été ${decision === 'approuvee' ? 'approuvée' : 'refusée'}.`,
    type: 'conge',
  });

  await activityLogRepository.create(reviewedBy, 'conge_traite', `Demande de congé #${id} ${decision === 'approuvee' ? 'approuvée' : 'refusée'}`);

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
  const isAdmin = requestingUser.role === 'ADMIN_RH' || requestingUser.role === 'SUPERADMIN';
  const isValidateur = demande.validateur_id === requestingUser.id;
  if (!isOwner && !isAdmin && !isValidateur) throw new Error('Accès refusé à cette demande');

  return demande;
}

async function getJustificatifPourTelechargement(id, requestingUser) {
  const demande = await congeRepository.findById(id);
  if (!demande) throw new Error('Demande introuvable');
  if (!demande.justificatif_path) throw new Error('Aucun justificatif pour cette demande');

  const isOwner = demande.user_id === requestingUser.id;
  const isAdmin = requestingUser.role === 'ADMIN_RH' || requestingUser.role === 'SUPERADMIN';
  const isValidateur = demande.validateur_id === requestingUser.id;
  if (!isOwner && !isAdmin && !isValidateur) throw new Error('Accès refusé à ce document');

  return demande;
}

module.exports = {
  createDemande, getMyDemandes, getPendingDemandes, reviewDemande,
  getRecentDemandes, getCalendarDemandes, getDemandeDetails,
  getPendingForValidateur, reviewIntermediaire, uploadJustificatif,
  getJustificatifPourTelechargement,
};