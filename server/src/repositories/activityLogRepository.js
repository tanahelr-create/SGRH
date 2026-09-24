const pool = require('../config/db');

async function create(userId, actionType, description) {
  await pool.query(
    `INSERT INTO activity_log (user_id, action_type, description) VALUES ($1, $2, $3)`,
    [userId, actionType, description]
  );
}

async function findRecent(limit = 50, excludeTypes = []) {
  const params = [];
  let whereClause = '';
  if (excludeTypes.length > 0) {
    params.push(excludeTypes);
    whereClause = `WHERE l.action_type <> ALL($${params.length})`;
  }
  params.push(limit);
  const result = await pool.query(
    `SELECT l.*, ud.email, ud.nom, ud.prenom, ud.role
     FROM activity_log l
     LEFT JOIN user_details ud ON ud.id = l.user_id
     ${whereClause}
     ORDER BY l.created_at DESC LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

module.exports = { create, findRecent };