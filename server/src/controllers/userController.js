const userRepository = require('../repositories/userRepository');
const userService = require('../services/userService');

async function list(req, res) {
  const { role, fonction } = req.query;
  const users = await userRepository.listActive({ role, fonction });
  return res.status(200).json({ users });
}

async function changeFonction(req, res) {
  try {
    const user = await userService.changeFonction(req.params.id, req.body.fonction, req.user.id);
    return res.status(200).json({ message: 'Fonction mise à jour', user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function fonctionHistory(req, res) {
  const history = await userService.getFonctionHistory(req.params.id);
  return res.status(200).json({ history });
}

async function personnel(req, res) {
  const { role } = req.query;
  const userRepository = require('../repositories/userRepository');
  const list = await userRepository.listPersonnelWithLeaveStatus({ role });
  return res.status(200).json({ personnel: list });
}

module.exports = { list, changeFonction, fonctionHistory, personnel };