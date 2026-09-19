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

  try {
    const archived = await corbeilleRepository.archiveAndDeleteCompte(req.params.id, req.user.id);
    if (!archived) return res.status(404).json({ message: 'Compte introuvable' });

    await activityLogRepository.create(req.user.id, 'compte_supprime', `Compte #${req.params.id} déplacé dans la corbeille`);
    return res.status(200).json({ message: 'Compte déplacé dans la corbeille' });
  } catch (err) {
    console.error('Erreur lors de la suppression du compte', req.params.id, err);
    return res.status(500).json({ message: "La suppression du compte a échoué. Aucune donnée n'a été modifiée." });
  }
}

module.exports = { list, deactivate, reactivate, remove };