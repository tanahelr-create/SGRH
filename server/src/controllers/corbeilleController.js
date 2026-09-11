const corbeilleRepository = require('../repositories/corbeilleRepository');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function list(req, res) {
  const items = await corbeilleRepository.listAll();
  return res.status(200).json({ items });
}

async function restore(req, res) {
  const item = await corbeilleRepository.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Élément introuvable dans la corbeille' });

  if (item.type_element === 'compte') {
    const restored = await userRepository.restore(item.donnees);
    if (!restored) {
      return res.status(400).json({ message: 'Restauration impossible : un compte avec ce même id, email ou fiche personnel existe déjà' });
    }
  } else {
    return res.status(400).json({ message: `Type d'élément non pris en charge pour la restauration : ${item.type_element}` });
  }

  await corbeilleRepository.removeFromCorbeille(req.params.id);
  await activityLogRepository.create(req.user.id, 'element_restaure', `${item.type_element} restauré depuis la corbeille`);

  return res.status(200).json({ message: 'Élément restauré' });
}

async function remove(req, res) {
  const item = await corbeilleRepository.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Élément introuvable' });

  await corbeilleRepository.removeFromCorbeille(req.params.id);
  await activityLogRepository.create(req.user.id, 'element_supprime_definitivement', `${item.type_element} supprimé définitivement de la corbeille`);

  return res.status(200).json({ message: 'Supprimé définitivement' });
}

module.exports = { list, restore, remove };