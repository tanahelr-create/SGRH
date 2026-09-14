const congeService = require('../services/congeService');

async function create(req, res) {
  const { typeConge, dateDebut, dateFin, motif, lieuJouissance, dateRepriseService, remplacant } = req.body;
  if (!typeConge || !dateDebut || !dateFin) {
    return res.status(400).json({ message: 'typeConge, dateDebut et dateFin sont requis' });
  }
  try {
    const demande = await congeService.createDemande(req.user.id, {
      typeConge, dateDebut, dateFin, motif, lieuJouissance, dateRepriseService, remplacant,
    });
    return res.status(201).json({ message: 'Demande envoyée', demande });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function myDemandes(req, res) {
  const demandes = await congeService.getMyDemandes(req.user.id);
  return res.status(200).json({ demandes });
}

async function pending(req, res) {
  const demandes = await congeService.getPendingDemandes();
  return res.status(200).json({ demandes });
}

async function pendingPourValidateur(req, res) {
  const demandes = await congeService.getPendingForValidateur(req.user.id);
  return res.status(200).json({ demandes });
}

async function reviewIntermediaire(req, res) {
  try {
    const demande = await congeService.reviewIntermediaire(req.params.id, req.body.decision, req.user.id, req.body.avis);
    return res.status(200).json({ message: 'Avis enregistré', demande });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function review(req, res) {
  try {
    const demande = await congeService.reviewDemande(req.params.id, req.body.decision, req.user.id, req.body.avisChefService);
    return res.status(200).json({ message: 'Demande traitée', demande });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function recent(req, res) {
  const demandes = await congeService.getRecentDemandes(5);
  return res.status(200).json({ demandes });
}

async function calendar(req, res) {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const demandes = await congeService.getCalendarDemandes(year, month);
  return res.status(200).json({ demandes });
}

async function getOne(req, res) {
  try {
    const demande = await congeService.getDemandeDetails(req.params.id, req.user);
    return res.status(200).json({ demande });
  } catch (err) {
    return res.status(err.message === 'Accès refusé à cette demande' ? 403 : 404).json({ message: err.message });
  }
}

module.exports = { create, myDemandes, pending, pendingPourValidateur, reviewIntermediaire, review, recent, calendar, getOne };