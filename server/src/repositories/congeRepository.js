const pool = require('../config/db');

async function create({ userId, typeConge, dateDebut, dateFin, motif }) {
  const result = await pool.query(
    `INSERT INTO conges (user_id, type_conge, date_debut, date_fin, motif)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, typeConge, dateDebut, dateFin, motif || null]
  );
  return result.rows[0];
}

async function findByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM conges WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findPending() {
  const result = await pool.query(
    `SELECT c.*, ud.email, ud.nom, ud.prenom, ud.role
     FROM conges c JOIN user_details ud ON ud.id = c.user_id
     WHERE c.status = 'en_attente' ORDER BY c.created_at ASC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM conges WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function updateStatus(id, status, reviewedBy, avisChefService) {
  const result = await pool.query(
    `UPDATE conges SET status = $2, reviewed_by = $3, reviewed_at = NOW(), avis_chef_service = $4
     WHERE id = $1 RETURNING *`,
    [id, status, reviewedBy, avisChefService || null]
  );
  return result.rows[0];
}

async function findRecent(limit = 5) {
  const result = await pool.query(
    `SELECT c.*, ud.email, ud.nom, ud.prenom, ud.role
     FROM conges c JOIN user_details ud ON ud.id = c.user_id
     ORDER BY c.created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function findForMonth(year, month) {
  const result = await pool.query(
    `SELECT c.id, c.date_debut, c.date_fin, c.status, ud.nom, ud.prenom
     FROM conges c JOIN user_details ud ON ud.id = c.user_id
     WHERE c.status IN ('approuvee', 'en_attente')
       AND c.date_debut <= (make_date($1, $2, 1) + INTERVAL '1 month' - INTERVAL '1 day')
       AND c.date_fin >= make_date($1, $2, 1)`,
    [year, month]
  );
  return result.rows;
}

async function findByIdWithDetails(id) {
  const result = await pool.query(
    `SELECT c.*, ud.matricule, ud.nom, ud.prenom, ud.fonction, ud.corps, ud.grade, ud.role, ud.email
     FROM conges c JOIN user_details ud ON ud.id = c.user_id
     WHERE c.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findByUser, findPending, findById, updateStatus, findRecent, findForMonth, findByIdWithDetails };