const parametreCarriereRepository = require('../repositories/parametreCarriereRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function list(req, res) {
  const params = await parametreCarriereRepository.listAll();
  return res.status(200).json({ parametres: params });
}

async function update(req, res) {
  const { valeur } = req.body;
  if (valeur === undefined || valeur === null || valeur === '') {
    return res.status(400).json({ message: 'La valeur est requise' });
  }
  const updated = await parametreCarriereRepository.update(req.params.cle, String(valeur), req.user.id);
  if (!updated) return res.status(404).json({ message: 'Paramètre introuvable' });

  await activityLogRepository.create(req.user.id, 'parametre_carriere_modifie', `Paramètre "${req.params.cle}" modifié : ${updated.valeur}`);
  return res.status(200).json({ message: 'Paramètre mis à jour', parametre: updated });
}

module.exports = { list, update };