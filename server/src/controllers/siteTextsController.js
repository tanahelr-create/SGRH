const siteTextsRepository = require('../repositories/siteTextsRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function getAll(req, res) {
  const texts = await siteTextsRepository.getAll();
  const map = {};
  texts.forEach((t) => { map[t.key] = t.value; });
  return res.status(200).json({ texts: map, list: texts });
}

async function ensureDefault(req, res) {
  const { key, defaultValue, category } = req.body;
  if (!key || defaultValue === undefined || !category) {
    return res.status(400).json({ message: 'key, defaultValue et category requis' });
  }
  await siteTextsRepository.ensureDefault(key, defaultValue, category);
  return res.status(200).json({ message: 'ok' });
}

async function update(req, res) {
  const { key, value } = req.body;
  if (!key || value === undefined) return res.status(400).json({ message: 'key et value requis' });

  const updated = await siteTextsRepository.updateOne(key, value);
  if (!updated) return res.status(404).json({ message: 'Clé introuvable' });

  await activityLogRepository.create(req.user.id, 'texte_modifie', `Texte "${key}" mis à jour`);
  return res.status(200).json({ message: 'Texte mis à jour', updated });
}

module.exports = { getAll, ensureDefault, update };