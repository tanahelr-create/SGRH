const situationAdministrativeRepository = require('../repositories/situationAdministrativeRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

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
    createdBy,
  });

  await activityLogRepository.create(createdBy, 'situation_administrative', `Nouvelle situation administrative enregistrée pour la fiche #${personnelId}`);
  return situation;
}

async function getForPersonnel(personnelId) {
  const historique = await situationAdministrativeRepository.findByPersonnel(personnelId);
  const actuelle = historique.find((s) => !s.date_fin) || null;
  return { actuelle, historique };
}

module.exports = { listTypes, addSituation, getForPersonnel };