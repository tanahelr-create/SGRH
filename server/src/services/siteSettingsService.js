const siteSettingsRepository = require('../repositories/siteSettingsRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

async function getSettings() {
  return siteSettingsRepository.getAll();
}

async function updateSetting(key, value, changedBy) {
  if (!HEX_REGEX.test(value)) {
    throw new Error('Couleur invalide (format attendu : #RRGGBB)');
  }
  const updated = await siteSettingsRepository.updateOne(key, value);
  await activityLogRepository.create(changedBy, 'apparence_modifiee', `Couleur "${key}" changée en ${value}`);
  return updated;
}

module.exports = { getSettings, updateSetting };