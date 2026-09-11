const pool = require('../config/db');

async function create({ email, role, fonction, token, sentBy, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO invitations (email, role, fonction, token, sent_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [email, role, fonction, token, sentBy, expiresAt]
  );
  return result.rows[0];
}

async function findPendingByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM invitations WHERE email = $1 AND status = 'envoyee'`,
    [email]
  );
  return result.rows[0] || null;
}

async function findByToken(token) {
  const result = await pool.query(`SELECT * FROM invitations WHERE token = $1`, [token]);
  return result.rows[0] || null;
}

async function markAsSubmitted(id, submittedData) {
  const result = await pool.query(
    `UPDATE invitations SET status = 'soumise', submitted_data = $2 WHERE id = $1 RETURNING *`,
    [id, submittedData]
  );
  return result.rows[0];
}

async function findAllSubmitted() {
  const result = await pool.query(
    `SELECT * FROM invitations WHERE status = 'soumise' ORDER BY created_at DESC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM invitations WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function markAsConfirmed(id, createdUserId) {
  const result = await pool.query(
    `UPDATE invitations SET status = 'confirmee', created_user_id = $2 WHERE id = $1 RETURNING *`,
    [id, createdUserId]
  );
  return result.rows[0];
}

async function markAsRejected(id) {
  const result = await pool.query(
    `UPDATE invitations SET status = 'refusee' WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function countByStatus(status) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM invitations WHERE status = $1`,
    [status]
  );
  return result.rows[0].count;
}

module.exports = {
  create, findPendingByEmail, findByToken, markAsSubmitted,
  findAllSubmitted, findById, markAsConfirmed, markAsRejected, countByStatus,
};