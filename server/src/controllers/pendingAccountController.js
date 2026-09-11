const pendingAccountService = require('../services/pendingAccountService');

async function list(req, res) {
  const accounts = await pendingAccountService.listPending();
  return res.status(200).json({ accounts });
}

async function approve(req, res) {
  try {
    const user = await pendingAccountService.approve(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Compte activé', user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function reject(req, res) {
  try {
    await pendingAccountService.reject(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Compte refusé' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { list, approve, reject };