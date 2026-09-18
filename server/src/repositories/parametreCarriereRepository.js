const pool = require('../config/db');

async function listAll() {
  const result = await pool.query(`SELECT cle, valeur, description, a_valider, updated_at FROM parametres_carriere ORDER BY cle`);
  return result.rows;
}

async function update(cle, valeur, updatedBy) {
  const result = await pool.query(
    `UPDATE parametres_carriere SET valeur = $2, updated_at = NOW(), updated_by = $3 WHERE cle = $1 RETURNING *`,
    [cle, valeur, updatedBy]
  );
  return result.rows[0] || null;
}

module.exports = { listAll, update };