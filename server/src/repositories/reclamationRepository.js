const pool = require('../config/db');

async function create({ auteurId, sujet, description }) {
  const result = await pool.query(
    `INSERT INTO reclamations (auteur_id, sujet, description) VALUES ($1, $2, $3) RETURNING *`,
    [auteurId, sujet, description]
  );
  return result.rows[0];
}

async function findByAuteur(auteurId) {
  const result = await pool.query(
    `SELECT * FROM reclamations WHERE auteur_id = $1 ORDER BY created_at DESC`,
    [auteurId]
  );
  return result.rows;
}

// Vue Superadmin : ouvertes en premier, puis les plus récentes, avec l'identité de
// l'auteur et de la personne qui a traité la réclamation.
async function listAll() {
  const result = await pool.query(
    `SELECT r.*, a.email AS auteur_email, a.nom AS auteur_nom, a.prenom AS auteur_prenom,
            t.email AS traite_par_email
     FROM reclamations r
     LEFT JOIN user_details a ON a.id = r.auteur_id
     LEFT JOIN user_details t ON t.id = r.traite_par
     ORDER BY (r.statut = 'ouverte') DESC, r.created_at DESC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM reclamations WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function marquerTraitee(id, { traitePar, reponse }) {
  const result = await pool.query(
    `UPDATE reclamations SET statut = 'traitee', reponse = $2, traite_par = $3, traite_le = now()
     WHERE id = $1 RETURNING *`,
    [id, reponse, traitePar]
  );
  return result.rows[0];
}

module.exports = { create, findByAuteur, listAll, findById, marquerTraitee };
