const pool = require('../config/db');

async function listTypes() {
  const result = await pool.query(`SELECT id, code, libelle, categories_concernees FROM types_situation_administrative ORDER BY libelle`);
  return result.rows;
}

async function findCurrentOpen(personnelId) {
  const result = await pool.query(
    `SELECT * FROM situations_administratives WHERE personnel_id = $1 AND date_fin IS NULL ORDER BY date_debut DESC LIMIT 1`,
    [personnelId]
  );
  return result.rows[0] || null;
}

async function closeSituation(id, dateFin) {
  await pool.query(`UPDATE situations_administratives SET date_fin = $2 WHERE id = $1`, [id, dateFin]);
}

async function create({ personnelId, typeSituationId, dateDebut, referenceDecision, documentFilename, documentPath, observations, createdBy }) {
  const result = await pool.query(
    `INSERT INTO situations_administratives
       (personnel_id, type_situation_id, date_debut, reference_decision, document_filename, document_path, observations, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [personnelId, typeSituationId, dateDebut, referenceDecision || null, documentFilename || null, documentPath || null, observations || null, createdBy]
  );
  return result.rows[0];
}

async function findByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT sa.*, t.code, t.libelle
     FROM situations_administratives sa
     JOIN types_situation_administrative t ON t.id = sa.type_situation_id
     WHERE sa.personnel_id = $1
     ORDER BY sa.date_debut DESC`,
    [personnelId]
  );
  return result.rows;
}

module.exports = { listTypes, findCurrentOpen, closeSituation, create, findByPersonnel };