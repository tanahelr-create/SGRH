const carriereRepository = require('../repositories/carriereRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function addEvenement(personnelId, { typeEvenement, description, dateEvenement }, createdBy) {
  const evenement = await carriereRepository.createEvenement({
    personnelId, typeEvenement, description, dateEvenement, createdBy,
  });
  await activityLogRepository.create(createdBy, 'carriere_evenement', `Événement "${typeEvenement}" ajouté à la carrière (fiche #${personnelId})`);
  return evenement;
}

async function getCarriere(personnelId) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const [evenements, fonctionHistory] = await Promise.all([
    carriereRepository.findEvenementsByPersonnel(personnelId),
    carriereRepository.findFonctionHistoryByPersonnel(personnelId),
  ]);

  // Fusionne les deux sources en une seule timeline triée par date, la plus récente en premier
  const timeline = [
    ...evenements.map((e) => ({
      date: e.date_evenement,
      type: e.type_evenement,
      description: e.description,
      source: 'evenement',
    })),
    ...fonctionHistory.map((h) => ({
      date: h.changed_at,
      type: 'Avancement de grade',
      description: `${h.ancienne_fonction || 'Aucune fonction'} → ${h.nouvelle_fonction}`,
      source: 'fonction',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return { personnel, timeline };
}

async function getEcheancesProches() {
  return carriereRepository.findEcheancesProches(30);
}

module.exports = { addEvenement, getCarriere, getEcheancesProches };