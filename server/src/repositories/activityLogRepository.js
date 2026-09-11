const pool = require('../config/db');

async function create(userId, actionType, description) {
  await pool.query(
    `INSERT INTO activity_log (user_id, action_type, description) VALUES ($1, $2, $3)`,
    [userId, actionType, description]
  );
}

async function findRecent(limit = 50) {
  const result = await pool.query(
    `SELECT l.*, ud.email, ud.nom, ud.prenom, ud.role
     FROM activity_log l
     LEFT JOIN user_details ud ON ud.id = l.user_id
     ORDER BY l.created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { create, findRecent };