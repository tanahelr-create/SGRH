const pool = require('../config/db');

// Anti-doublon géré par l'index unique partiel (personnel_id, type) WHERE statut='OUVERTE' :
// ON CONFLICT DO NOTHING évite de créer une 2e alerte ouverte du même type pour le
// même agent tant que la première n'a pas été traitée/ignorée.
async function creerSiAbsente({ personnelId, type, dateEcheanceTheorique, details }) {
  const result = await pool.query(
    `INSERT INTO alertes_avancement (personnel_id, type, date_echeance_theorique, details)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (personnel_id, type) WHERE statut = 'OUVERTE' DO NOTHING
     RETURNING *`,
    [personnelId, type, dateEcheanceTheorique || null, details ? JSON.stringify(details) : null]
  );
  return result.rows[0] || null;
}

async function findOuvertes({ personnelId } = {}) {
  const result = await pool.query(
    `SELECT a.*, p.nom, p.prenom, p.matricule
     FROM alertes_avancement a
     JOIN personnel p ON p.id = a.personnel_id
     WHERE a.statut = 'OUVERTE' AND ($1::integer IS NULL OR a.personnel_id = $1)
     ORDER BY a.date_echeance_theorique ASC NULLS LAST, a.created_at DESC`,
    [personnelId || null]
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM alertes_avancement WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function marquerTraitee(id, { evenementResultantId, traitePar }) {
  const result = await pool.query(
    `UPDATE alertes_avancement
     SET statut = 'TRAITEE', evenement_resultant_id = $2, traite_par = $3, traite_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, evenementResultantId || null, traitePar]
  );
  return result.rows[0] || null;
}

async function marquerIgnoree(id, traitePar) {
  const result = await pool.query(
    `UPDATE alertes_avancement SET statut = 'IGNOREE', traite_par = $2, traite_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, traitePar]
  );
  return result.rows[0] || null;
}

module.exports = { creerSiAbsente, findOuvertes, findById, marquerTraitee, marquerIgnoree };
