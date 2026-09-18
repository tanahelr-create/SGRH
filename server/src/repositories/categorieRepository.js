const pool = require('../config/db');

async function listAll() {
  const result = await pool.query(
    `SELECT id, numero, code, appellation, niveau_diplome FROM categories_professionnelles ORDER BY numero`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM categories_professionnelles WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

module.exports = { listAll, findById };