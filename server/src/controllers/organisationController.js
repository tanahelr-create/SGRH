const organisationRepository = require('../repositories/organisationRepository');

async function directions(req, res) {
  const list = await organisationRepository.listDirections();
  return res.status(200).json({ directions: list });
}

async function services(req, res) {
  const { directionId } = req.query;
  const list = await organisationRepository.listServices(directionId || null);
  return res.status(200).json({ services: list });
}

module.exports = { directions, services };