const pool = require('../config/db');
const { generateToken } = require('../utils/token');

async function create(userId) {
  const token = generateToken();
  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 minutes')
     RETURNING *`,
    [userId, token]
  );
  return result.rows[0];
}

async function findValid(token) {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

async function markUsed(id) {
  await pool.query(`UPDATE password_reset_tokens SET used = true WHERE id = $1`, [id]);
}

module.exports = { create, findValid, markUsed };