const carriereService = require('../services/carriereService');
const personnelRepository = require('../repositories/personnelRepository');

async function getForPersonnel(req, res) {
  try {
    const result = await carriereService.getCarriere(req.params.personnelId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

async function getMine(req, res) {
  const personnel = await personnelRepository.findByUserId(req.user.id);
  if (!personnel) return res.status(404).json({ message: 'Aucune fiche personnel associée' });

  const result = await carriereService.getCarriere(personnel.id);
  return res.status(200).json(result);
}

async function addEvenement(req, res) {
  const { typeEvenement, description, dateEvenement } = req.body;
  if (!typeEvenement || !dateEvenement) {
    return res.status(400).json({ message: 'typeEvenement et dateEvenement sont requis' });
  }
  try {
    const evenement = await carriereService.addEvenement(
      req.params.personnelId, { typeEvenement, description, dateEvenement }, req.user.id
    );
    return res.status(201).json({ message: 'Événement ajouté', evenement });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function echeances(req, res) {
  const list = await carriereService.getEcheancesProches();
  return res.status(200).json({ echeances: list });
}

module.exports = { getForPersonnel, getMine, addEvenement, echeances };