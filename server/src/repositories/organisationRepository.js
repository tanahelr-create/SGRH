const pool = require('../config/db');

async function listDirections() {
  const result = await pool.query(`SELECT id, nom, responsable_personnel_id FROM directions ORDER BY nom`);
  return result.rows;
}

async function listServices(directionId) {
  if (directionId) {
    const result = await pool.query(
      `SELECT id, nom, direction_id, responsable_personnel_id FROM services WHERE direction_id = $1 ORDER BY nom`,
      [directionId]
    );
    return result.rows;
  }
  const result = await pool.query(`SELECT id, nom, direction_id, responsable_personnel_id FROM services ORDER BY nom`);
  return result.rows;
}

async function syncResponsable(personnelId, fonction, service, direction) {
  // On retire d'abord cette personne de tout poste de responsable existant
  // (cas d'un changement de service/direction/fonction)
  await pool.query(`UPDATE directions SET responsable_personnel_id = NULL WHERE responsable_personnel_id = $1`, [personnelId]);
  await pool.query(`UPDATE services SET responsable_personnel_id = NULL WHERE responsable_personnel_id = $1`, [personnelId]);

  if (fonction === 'Chef de service' && service) {
    await pool.query(`UPDATE services SET responsable_personnel_id = $1 WHERE nom = $2`, [personnelId, service]);
  }
  if (fonction === 'Responsable/Directeur' && direction) {
    await pool.query(`UPDATE directions SET responsable_personnel_id = $1 WHERE nom = $2`, [personnelId, direction]);
  }
}

module.exports = { listDirections, listServices, syncResponsable };