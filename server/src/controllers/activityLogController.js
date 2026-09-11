const activityLogRepository = require('../repositories/activityLogRepository');

async function list(req, res) {
  const limit = Number(req.query.limit) || 50;
  const logs = await activityLogRepository.findRecent(limit);
  return res.status(200).json({ logs });
}

module.exports = { list };