const pool = require('../config/db');

async function createEvenement({ personnelId, typeEvenement, description, dateEvenement, createdBy }) {
  const result = await pool.query(
    `INSERT INTO carriere_evenements (personnel_id, type_evenement, description, date_evenement, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [personnelId, typeEvenement, description || null, dateEvenement, createdBy]
  );
  return result.rows[0];
}

async function findEvenementsByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT * FROM carriere_evenements WHERE personnel_id = $1 ORDER BY date_evenement DESC`,
    [personnelId]
  );
  return result.rows;
}

async function findFonctionHistoryByPersonnel(personnelId) {
  // fonction_history est lié à user_id, pas personnel_id directement — on passe par users
  const result = await pool.query(
    `SELECT h.* FROM fonction_history h
     JOIN users u ON u.id = h.user_id
     WHERE u.personnel_id = $1
     ORDER BY h.changed_at DESC`,
    [personnelId]
  );
  return result.rows;
}

async function findEcheancesProches(days = 30) {
  const result = await pool.query(
    `SELECT id, matricule, nom, prenom, email, type_contrat, date_echeance_contrat
     FROM personnel
     WHERE date_echeance_contrat IS NOT NULL
       AND date_echeance_contrat BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1 || ' days')::interval
     ORDER BY date_echeance_contrat ASC`,
    [days]
  );
  return result.rows;
}

module.exports = { createEvenement, findEvenementsByPersonnel, findFonctionHistoryByPersonnel, findEcheancesProches };