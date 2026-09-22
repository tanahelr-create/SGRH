const organisationRepository = require('../repositories/organisationRepository');
const organisationService = require('../services/organisationService');

const { OrganisationError } = organisationService;

function sendError(res, err) {
  if (err instanceof OrganisationError) return res.status(err.status).json({ message: err.message });
  console.error('[organisation]', err);
  return res.status(500).json({ message: 'Une erreur interne est survenue. Veuillez réessayer.' });
}

async function directions(req, res) {
  const list = await organisationRepository.listDirections();
  return res.status(200).json({ directions: list });
}

async function services(req, res) {
  const { directionId } = req.query;
  const list = await organisationRepository.listServices(directionId || null);
  return res.status(200).json({ services: list });
}

async function createDirection(req, res) {
  try {
    const direction = await organisationService.creerDirection(req.body.nom, req.user.id);
    return res.status(201).json({ message: 'Direction créée', direction });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteDirection(req, res) {
  try {
    await organisationService.supprimerDirection(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Direction supprimée' });
  } catch (err) {
    return sendError(res, err);
  }
}

async function createService(req, res) {
  try {
    const service = await organisationService.creerService(req.body.nom, req.body.directionId, req.user.id);
    return res.status(201).json({ message: 'Service créé', service });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteService(req, res) {
  try {
    await organisationService.supprimerService(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Service supprimé' });
  } catch (err) {
    return sendError(res, err);
  }
}

module.exports = { directions, services, createDirection, deleteDirection, createService, deleteService };
