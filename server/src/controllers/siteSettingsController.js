const siteSettingsService = require('../services/siteSettingsService');

async function get(req, res) {
  const settings = await siteSettingsService.getSettings();
  return res.status(200).json({ settings });
}

async function update(req, res) {
  const { key, value } = req.body;
  if (!key || !value) return res.status(400).json({ message: 'key et value requis' });

  try {
    const updated = await siteSettingsService.updateSetting(key, value, req.user.id);
    return res.status(200).json({ message: 'Couleur mise à jour', updated });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { get, update };