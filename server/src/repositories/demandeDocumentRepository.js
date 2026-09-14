const pool = require('../config/db');

async function create({ personnelId, typeDocument, motif }) {
  const result = await pool.query(
    `INSERT INTO demandes_documents (personnel_id, type_document, motif)
     VALUES ($1, $2, $3) RETURNING *`,
    [personnelId, typeDocument, motif || null]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM demandes_documents WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findPending() {
  const result = await pool.query(
    `SELECT d.*, p.matricule, p.nom, p.prenom, p.email
     FROM demandes_documents d JOIN personnel p ON p.id = d.personnel_id
     WHERE d.statut = 'en_attente' ORDER BY d.date_demande ASC`
  );
  return result.rows;
}

async function findByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT * FROM demandes_documents WHERE personnel_id = $1 ORDER BY date_demande DESC`,
    [personnelId]
  );
  return result.rows;
}

async function marquerTraitee(id, documentId, traitePar) {
  const result = await pool.query(
    `UPDATE demandes_documents SET statut = 'traitee', document_id = $2, traite_par = $3, date_traitement = NOW()
     WHERE id = $1 RETURNING *`,
    [id, documentId, traitePar]
  );
  return result.rows[0];
}

async function marquerRefusee(id, traitePar) {
  const result = await pool.query(
    `UPDATE demandes_documents SET statut = 'refusee', traite_par = $2, date_traitement = NOW()
     WHERE id = $1 RETURNING *`,
    [id, traitePar]
  );
  return result.rows[0];
}

module.exports = { create, findById, findPending, findByPersonnel, marquerTraitee, marquerRefusee };