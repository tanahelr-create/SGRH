const statsService = require('../services/statsService');

async function adminDashboard(req, res) {
  const stats = await statsService.getAdminDashboardStats();
  return res.status(200).json(stats);
}

module.exports = { adminDashboard };