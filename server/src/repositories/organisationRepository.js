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

async function findDirectionById(id) {
  const result = await pool.query(`SELECT id, nom, responsable_personnel_id FROM directions WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findServiceById(id) {
  const result = await pool.query(`SELECT id, nom, direction_id, responsable_personnel_id FROM services WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function createDirection(nom) {
  const result = await pool.query(`INSERT INTO directions (nom) VALUES ($1) RETURNING id, nom, responsable_personnel_id`, [nom]);
  return result.rows[0];
}

async function deleteDirection(id) {
  await pool.query(`DELETE FROM directions WHERE id = $1`, [id]);
}

async function createService(nom, directionId) {
  const result = await pool.query(
    `INSERT INTO services (nom, direction_id) VALUES ($1, $2) RETURNING id, nom, direction_id, responsable_personnel_id`,
    [nom, directionId]
  );
  return result.rows[0];
}

async function deleteService(id) {
  await pool.query(`DELETE FROM services WHERE id = $1`, [id]);
}

async function countServicesByDirection(directionId) {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM services WHERE direction_id = $1`, [directionId]);
  return result.rows[0].count;
}

// personnel.direction / personnel.service sont du texte libre relié par le nom (pas de FK,
// voir server/database/MCD.md) : on vérifie donc par nom, pas par identifiant.
async function countPersonnelByDirectionNom(nom) {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM personnel WHERE direction = $1`, [nom]);
  return result.rows[0].count;
}

async function countPersonnelByServiceNom(nom) {
  const result = await pool.query(`SELECT COUNT(*)::int AS count FROM personnel WHERE service = $1`, [nom]);
  return result.rows[0].count;
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

module.exports = {
  listDirections, listServices, syncResponsable,
  findDirectionById, findServiceById, createDirection, deleteDirection,
  createService, deleteService, countServicesByDirection,
  countPersonnelByDirectionNom, countPersonnelByServiceNom,
};