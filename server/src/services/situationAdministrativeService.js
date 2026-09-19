const situationAdministrativeRepository = require('../repositories/situationAdministrativeRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const notificationRepository = require('../repositories/notificationRepository');

async function listTypes() {
  return situationAdministrativeRepository.listTypes();
}

async function addSituation(personnelId, data, createdBy) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  // On ferme automatiquement la situation en cours (jamais écrasée : sa ligne reste
  // intacte, seule sa date de fin est renseignée) avant d'ouvrir la nouvelle.
  const current = await situationAdministrativeRepository.findCurrentOpen(personnelId);
  if (current) {
    if (new Date(data.dateDebut) < new Date(current.date_debut)) {
      throw new Error('La date de début doit être postérieure au début de la situation en cours');
    }
    await situationAdministrativeRepository.closeSituation(current.id, data.dateDebut);
  }

  const situation = await situationAdministrativeRepository.create({
    personnelId,
    typeSituationId: data.typeSituationId,
    dateDebut: data.dateDebut,
    referenceDecision: data.referenceDecision,
    documentFilename: data.justificatif?.filename || null,
    documentPath: data.justificatif?.path || null,
    observations: data.observations,
    motif: data.motif,
    createdBy,
  });

  await activityLogRepository.create(createdBy, 'situation_administrative', `Nouvelle situation administrative enregistrée pour la fiche #${personnelId}`);

  const destinataireUserId = await personnelRepository.findLinkedUserId(personnelId);
  if (destinataireUserId) {
    const types = await situationAdministrativeRepository.listTypes();
    const typeLibelle = types.find((t) => t.id === Number(data.typeSituationId))?.libelle || 'nouvelle situation';
    await notificationRepository.create({
      senderId: createdBy,
      recipientId: destinataireUserId,
      title: 'Changement de situation administrative',
      message: `Votre situation administrative a été mise à jour : ${typeLibelle}.`,
      type: 'info',
      lien: '/carriere',
    });
  }

  return situation;
}

async function getForPersonnel(personnelId) {
  const historique = await situationAdministrativeRepository.findByPersonnel(personnelId);
  const actuelle = historique.find((s) => !s.date_fin) || null;
  return { actuelle, historique };
}

async function updateSituation(id, data, userId) {
  const situation = await situationAdministrativeRepository.findById(id);
  if (!situation) throw new Error('Situation introuvable');

  const updated = await situationAdministrativeRepository.update(id, {
    referenceDecision: data.referenceDecision,
    observations: data.observations,
    motif: data.motif,
  });

  await activityLogRepository.create(
    userId, 'situation_administrative_modifiee',
    `Situation administrative #${id} modifiée pour la fiche #${situation.personnel_id}`
  );
  return updated;
}

// Ne peut être supprimée que la situation actuelle (non clôturée) : supprimer une
// situation historique laisserait un trou dans la timeline. En supprimant la
// situation ouverte, on rouvre celle qu'elle avait fermée (date_fin -> NULL),
// pour que la chaîne "une seule situation ouverte à la fois" reste cohérente.
async function deleteSituation(id, userId) {
  const situation = await situationAdministrativeRepository.findById(id);
  if (!situation) throw new Error('Situation introuvable');
  if (situation.date_fin !== null) {
    throw new Error("Seule la situation actuelle (non clôturée) peut être supprimée. Supprimez d'abord les situations plus récentes.");
  }

  const previous = await situationAdministrativeRepository.findClosedByFollowing(
    situation.personnel_id, situation.date_debut, situation.id
  );
  if (previous) {
    await situationAdministrativeRepository.reopenSituation(previous.id);
  }
  await situationAdministrativeRepository.remove(id);

  await activityLogRepository.create(
    userId, 'situation_administrative_supprimee',
    `Situation administrative #${id} supprimée pour la fiche #${situation.personnel_id}`
  );
}

module.exports = { listTypes, addSituation, getForPersonnel, updateSituation, deleteSituation };