const carriereRepository = require('../repositories/carriereRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const corbeilleRepository = require('../repositories/corbeilleRepository');

async function addEvenement(personnelId, data, createdBy) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const ancienneSituation = {
    corps: personnel.corps, grade: personnel.grade, classe: personnel.classe, echelon: personnel.echelon,
    indice: personnel.indice, fonction: personnel.fonction, service: personnel.service, direction: personnel.direction,
  };
  const nouvelleSituation = {
    corps: data.corps || null, grade: data.grade || null, classe: data.classe || null, echelon: data.echelon || null,
    indice: data.indice || null, fonction: data.fonction || null, affectation: data.affectation || null,
  };

  const evenement = await carriereRepository.createEvenement({
    personnelId,
    typeEvenement: data.typeEvenement,
    description: data.description,
    dateEvenement: data.dateEvenement,
    dateEffet: data.dateEffet,
    ancienneSituation,
    nouvelleSituation,
    corps: data.corps, grade: data.grade, classe: data.classe, echelon: data.echelon,
    indice: data.indice, fonction: data.fonction, affectation: data.affectation,
    motif: data.motif, referenceDecision: data.referenceDecision, autoriteDecision: data.autoriteDecision,
    observations: data.observations,
    justificatifFilename: data.justificatif?.filename || null,
    justificatifPath: data.justificatif?.path || null,
    createdBy,
  });

  await activityLogRepository.create(createdBy, 'carriere_evenement', `Événement "${data.typeEvenement}" ajouté à la carrière (fiche #${personnelId})`);
  return evenement;
}

async function updateEvenement(id, data, updatedBy) {
  const existing = await carriereRepository.findEvenementById(id);
  if (!existing) throw new Error('Événement introuvable');

  await corbeilleRepository.add('carriere_evenement_modifie', existing, updatedBy);

  const justificatifFilename = data.justificatif?.filename || existing.justificatif_filename;
  const justificatifPath = data.justificatif?.path || existing.justificatif_path;

  const updated = await carriereRepository.updateEvenement(id, {
    typeEvenement: data.typeEvenement ?? existing.type_evenement,
    description: data.description ?? existing.description,
    dateEvenement: data.dateEvenement ?? existing.date_evenement,
    dateEffet: data.dateEffet ?? existing.date_effet,
    corps: data.corps ?? existing.corps,
    grade: data.grade ?? existing.grade,
    classe: data.classe ?? existing.classe,
    echelon: data.echelon ?? existing.echelon,
    indice: data.indice ?? existing.indice,
    fonction: data.fonction ?? existing.fonction,
    affectation: data.affectation ?? existing.affectation,
    motif: data.motif ?? existing.motif,
    referenceDecision: data.referenceDecision ?? existing.reference_decision,
    autoriteDecision: data.autoriteDecision ?? existing.autorite_decision,
    observations: data.observations ?? existing.observations,
    justificatifFilename, justificatifPath,
    updatedBy,
  });

  await activityLogRepository.create(updatedBy, 'carriere_evenement_modifie', `Événement de carrière #${id} modifié (fiche #${existing.personnel_id})`);
  return updated;
}

async function deleteEvenement(id, deletedBy) {
  const existing = await carriereRepository.findEvenementById(id);
  if (!existing) throw new Error('Événement introuvable');

  await corbeilleRepository.add('carriere_evenement_supprime', existing, deletedBy);
  await carriereRepository.deleteEvenement(id);
  await activityLogRepository.create(deletedBy, 'carriere_evenement_supprime', `Événement de carrière #${id} supprimé (fiche #${existing.personnel_id})`);
}

async function getCarriere(personnelId) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const [evenements, fonctionHistory, diplomes] = await Promise.all([
    carriereRepository.findEvenementsByPersonnel(personnelId),
    carriereRepository.findFonctionHistoryByPersonnel(personnelId),
    carriereRepository.findDiplomesByPersonnel(personnelId),
  ]);

  const timeline = [
    ...evenements.map((e) => ({
      id: e.id,
      date: e.date_evenement,
      dateEffet: e.date_effet,
      type: e.type_evenement,
      description: e.description,
      corps: e.corps, grade: e.grade, classe: e.classe, echelon: e.echelon, indice: e.indice,
      fonction: e.fonction, affectation: e.affectation, motif: e.motif,
      referenceDecision: e.reference_decision, autoriteDecision: e.autorite_decision,
      observations: e.observations,
      ancienneSituation: e.ancienne_situation, nouvelleSituation: e.nouvelle_situation,
      justificatifFilename: e.justificatif_filename, justificatifPath: e.justificatif_path,
      source: 'evenement',
    })),
    ...fonctionHistory.map((h) => ({
      date: h.changed_at,
      type: 'Changement de fonction',
      description: `${h.ancienne_fonction || 'Aucune fonction'} → ${h.nouvelle_fonction}`,
      source: 'fonction',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return { personnel, timeline, diplomes };
}

async function addDiplome(personnelId, { intitule, etablissement, anneeObtention, document }, createdBy) {
  const diplome = await carriereRepository.createDiplome({
    personnelId, intitule, etablissement, anneeObtention,
    documentFilename: document?.filename || null, documentPath: document?.path || null, createdBy,
  });
  await activityLogRepository.create(createdBy, 'diplome_ajoute', `Diplôme "${intitule}" ajouté (fiche #${personnelId})`);
  return diplome;
}

async function deleteDiplome(id, deletedBy) {
  const existing = await carriereRepository.findDiplomeById(id);
  if (!existing) throw new Error('Diplôme introuvable');
  await corbeilleRepository.add('diplome_supprime', existing, deletedBy);
  await carriereRepository.deleteDiplome(id);
  await activityLogRepository.create(deletedBy, 'diplome_supprime', `Diplôme #${id} supprimé (fiche #${existing.personnel_id})`);
}

async function getEcheancesProches() {
  return carriereRepository.findEcheancesProches(30);
}

module.exports = { addEvenement, updateEvenement, deleteEvenement, getCarriere, getEcheancesProches, addDiplome, deleteDiplome };