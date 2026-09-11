const pool = require('../config/db');

async function create(email, code) {
  const result = await pool.query(
    `INSERT INTO otp_codes (email, code, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
     RETURNING *`,
    [email, code]
  );
  return result.rows[0];
}

async function findValid(email, code) {
  const result = await pool.query(
    `SELECT * FROM otp_codes
     WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [email, code]
  );
  return result.rows[0] || null;
}

async function markUsed(id) {
  await pool.query(`UPDATE otp_codes SET used = true WHERE id = $1`, [id]);
}

module.exports = { create, findValid, markUsed };