const userRepository = require('../repositories/userRepository');
const corbeilleRepository = require('../repositories/corbeilleRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function list(req, res) {
  const accounts = await userRepository.listAllAccounts();
  return res.status(200).json({ accounts });
}

async function deactivate(req, res) {
  const user = await userRepository.setStatus(req.params.id, 'inactive');
  if (!user) return res.status(404).json({ message: 'Compte introuvable' });
  await activityLogRepository.create(req.user.id, 'compte_desactive', `Compte #${req.params.id} désactivé`);
  return res.status(200).json({ message: 'Compte désactivé', user });
}

async function reactivate(req, res) {
  const user = await userRepository.setStatus(req.params.id, 'active');
  if (!user) return res.status(404).json({ message: 'Compte introuvable' });
  await activityLogRepository.create(req.user.id, 'compte_reactive', `Compte #${req.params.id} réactivé`);
  return res.status(200).json({ message: 'Compte réactivé', user });
}

async function remove(req, res) {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Impossible de supprimer son propre compte' });
  }

  const fullRow = await userRepository.findFullByIdRaw(req.params.id);
  if (!fullRow) return res.status(404).json({ message: 'Compte introuvable' });

  await corbeilleRepository.add('compte', fullRow, req.user.id);
  await userRepository.deleteRaw(req.params.id);
  await activityLogRepository.create(req.user.id, 'compte_supprime', `Compte #${req.params.id} déplacé dans la corbeille`);

  return res.status(200).json({ message: 'Compte déplacé dans la corbeille' });
}

module.exports = { list, deactivate, reactivate, remove };