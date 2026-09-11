const pool = require('../config/db');

async function create({ userId, ancienneFonction, nouvelleFonction, changedBy }) {
  const result = await pool.query(
    `INSERT INTO fonction_history (user_id, ancienne_fonction, nouvelle_fonction, changed_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, ancienneFonction, nouvelleFonction, changedBy]
  );
  return result.rows[0];
}

async function findByUser(userId) {
  const result = await pool.query(
    `SELECT h.*, ud.email AS changed_by_email
     FROM fonction_history h
     LEFT JOIN user_details ud ON ud.id = h.changed_by
     WHERE h.user_id = $1 ORDER BY h.changed_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { create, findByUser };