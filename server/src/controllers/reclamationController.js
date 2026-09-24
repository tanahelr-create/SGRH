const reclamationService = require('../services/reclamationService');

async function signaler(req, res) {
  try {
    const reclamation = await reclamationService.signaler(req.user.id, req.body);
    return res.status(201).json({ message: 'Réclamation envoyée', reclamation });
  } catch (err) {
    const status = err instanceof reclamationService.ReclamationError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
}

async function mesReclamations(req, res) {
  const reclamations = await reclamationService.mesReclamations(req.user.id);
  return res.status(200).json({ reclamations });
}

async function toutes(req, res) {
  const reclamations = await reclamationService.toutes();
  return res.status(200).json({ reclamations });
}

async function traiter(req, res) {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ message: 'Identifiant de réclamation invalide' });
  }
  try {
    const reclamation = await reclamationService.traiter(req.params.id, req.user.id, req.body.reponse);
    return res.status(200).json({ message: 'Réclamation traitée', reclamation });
  } catch (err) {
    const status = err instanceof reclamationService.ReclamationError ? err.status : 400;
    return res.status(status).json({ message: err.message });
  }
}

module.exports = { signaler, mesReclamations, toutes, traiter };
