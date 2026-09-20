const pool = require('../config/db');

async function listTypes() {
  const result = await pool.query(`SELECT id, code, libelle, categories_concernees FROM types_situation_administrative ORDER BY libelle`);
  return result.rows;
}

// Les fonctions d'écriture/verrouillage acceptent un `db` optionnel (client de
// transaction) : sans lui elles utilisent le pool, comme avant.

// Verrouille la fiche personnel jusqu'à la fin de la transaction : sérialise les
// opérations concurrentes sur les situations d'un même agent.
async function lockPersonnel(personnelId, db = pool) {
  const result = await db.query(`SELECT id FROM personnel WHERE id = $1 FOR UPDATE`, [personnelId]);
  return result.rows[0] || null;
}

// Toutes les situations du personnel qu'une nouvelle situation ouverte (début
// `dateDebut`, sans fin) ne peut pas coexister avec : celles qui commencent à la
// même date ou après, et celles déjà terminées à cette date ou après. La situation
// ouverte qui a commencé avant est volontairement exclue : elle sera fermée.
async function findConflicts(personnelId, dateDebut, db = pool) {
  const result = await db.query(
    `SELECT id, date_debut::text AS date_debut, date_fin::text AS date_fin
     FROM situations_administratives
     WHERE personnel_id = $1 AND (date_debut >= $2::date OR (date_fin IS NOT NULL AND date_fin >= $2::date))
     ORDER BY date_debut`,
    [personnelId, dateDebut]
  );
  return result.rows;
}

async function findCurrentOpen(personnelId, db = pool) {
  const result = await db.query(
    `SELECT * FROM situations_administratives WHERE personnel_id = $1 AND date_fin IS NULL ORDER BY date_debut DESC LIMIT 1`,
    [personnelId]
  );
  return result.rows[0] || null;
}

// Convention : la situation fermée se termine la veille du début de la suivante.
async function closeSituationDayBefore(id, nextDateDebut, db = pool) {
  await db.query(`UPDATE situations_administratives SET date_fin = $2::date - 1 WHERE id = $1`, [id, nextDateDebut]);
}

async function reopenSituation(id, db = pool) {
  await db.query(`UPDATE situations_administratives SET date_fin = NULL WHERE id = $1`, [id]);
}

async function create({ personnelId, typeSituationId, dateDebut, referenceDecision, documentFilename, documentPath, observations, motif, createdBy }, db = pool) {
  const result = await db.query(
    `INSERT INTO situations_administratives
       (personnel_id, type_situation_id, date_debut, reference_decision, document_filename, document_path, observations, motif, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [personnelId, typeSituationId, dateDebut, referenceDecision || null, documentFilename || null, documentPath || null, observations || null, motif || null, createdBy]
  );
  return result.rows[0];
}

async function findById(id, db = pool) {
  const result = await db.query(`SELECT *, date_debut::text AS date_debut_txt FROM situations_administratives WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

// La situation que celle qui commence à `dateDebut` avait fermée en s'ouvrant
// (même personnel, date_fin = veille de sa date_debut) — à rouvrir si on la supprime.
async function findClosedByFollowing(personnelId, dateDebut, excludingId, db = pool) {
  const result = await db.query(
    `SELECT * FROM situations_administratives
     WHERE personnel_id = $1 AND date_fin = $2::date - 1 AND id != $3`,
    [personnelId, dateDebut, excludingId]
  );
  return result.rows[0] || null;
}

async function update(id, { referenceDecision, observations, motif }) {
  const result = await pool.query(
    `UPDATE situations_administratives
     SET reference_decision = COALESCE($2, reference_decision),
         observations = COALESCE($3, observations),
         motif = COALESCE($4, motif)
     WHERE id = $1 RETURNING *`,
    [id, referenceDecision ?? null, observations ?? null, motif ?? null]
  );
  return result.rows[0] || null;
}

async function remove(id, db = pool) {
  await db.query(`DELETE FROM situations_administratives WHERE id = $1`, [id]);
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

module.exports = {
  listTypes, lockPersonnel, findConflicts, findCurrentOpen, closeSituationDayBefore, reopenSituation, create, findById,
  findClosedByFollowing, update, remove, findByPersonnel,
};