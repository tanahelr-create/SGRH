const pool = require('../config/db');

async function add(typeElement, donnees, supprimePar) {
  const result = await pool.query(
    `INSERT INTO corbeille (type_element, donnees, supprime_par) VALUES ($1, $2, $3) RETURNING *`,
    [typeElement, JSON.stringify(donnees), supprimePar]
  );
  return result.rows[0];
}

async function listAll() {
  const result = await pool.query(
    `SELECT c.*, ud.email AS supprime_par_email
     FROM corbeille c
     LEFT JOIN user_details ud ON ud.id = c.supprime_par
     ORDER BY c.supprime_le DESC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM corbeille WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function removeFromCorbeille(id) {
  await pool.query(`DELETE FROM corbeille WHERE id = $1`, [id]);
}

module.exports = { add, listAll, findById, removeFromCorbeille };