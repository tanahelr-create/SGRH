const pool = require('../config/db');

async function createContrat({
  personnelId, typeContrat, dateDebut, dateFin, numeroRenouvellement,
  contratPrecedentId, referenceDecision, observations, createdBy,
}) {
  const result = await pool.query(
    `INSERT INTO contrats (
       personnel_id, type_contrat, date_debut, date_fin, numero_renouvellement,
       contrat_precedent_id, reference_decision, observations, created_by
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [personnelId, typeContrat, dateDebut, dateFin || null, numeroRenouvellement || 0,
     contratPrecedentId || null, referenceDecision || null, observations || null, createdBy]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM contrats WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function findByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT * FROM contrats WHERE personnel_id = $1 ORDER BY date_debut DESC, id DESC`,
    [personnelId]
  );
  return result.rows;
}

async function updateDecision(id, { decision, motifNonRenouvellement, referenceDecision, updatedBy }) {
  const result = await pool.query(
    `UPDATE contrats
     SET decision = $2,
         motif_non_renouvellement = $3,
         reference_decision = COALESCE($4, reference_decision),
         statut = CASE WHEN $2::varchar = 'non_renouvele' THEN 'non_renouvele' ELSE statut END,
         updated_by = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, decision, motifNonRenouvellement || null, referenceDecision || null, updatedBy]
  );
  return result.rows[0] || null;
}

async function marquerRenouvele(id, updatedBy) {
  const result = await pool.query(
    `UPDATE contrats SET statut = 'renouvele', updated_by = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, updatedBy]
  );
  return result.rows[0] || null;
}

async function markNotified(id) {
  await pool.query(`UPDATE contrats SET notifie_echeance_le = NOW() WHERE id = $1`, [id]);
}

async function markExpirationNotified(id) {
  await pool.query(`UPDATE contrats SET notifie_expiration_le = NOW() WHERE id = $1`, [id]);
}

// Contrats "actifs" dont la date de fin est dépassée mais dont personne n'a
// encore pris de décision de renouvellement/non-renouvellement, et pas encore
// notifiés comme expirés (anti-doublon, même logique que markNotified).
async function findExpiresNonNotifies() {
  const result = await pool.query(
    `SELECT c.*, p.nom, p.prenom, p.matricule
     FROM contrats c
     JOIN personnel p ON p.id = c.personnel_id
     WHERE c.statut = 'actif'
       AND c.date_fin IS NOT NULL
       AND c.date_fin < CURRENT_DATE
       AND c.notifie_expiration_le IS NULL
     ORDER BY c.date_fin ASC`
  );
  return result.rows;
}

async function findEcheancesDansNJours(jours) {
  const result = await pool.query(
    `SELECT c.*, p.nom, p.prenom, p.matricule
     FROM contrats c
     JOIN personnel p ON p.id = c.personnel_id
     WHERE c.statut = 'actif'
       AND c.date_fin IS NOT NULL
       AND c.date_fin <= (CURRENT_DATE + $1 * INTERVAL '1 day')
       AND c.date_fin >= CURRENT_DATE
       AND c.notifie_echeance_le IS NULL
     ORDER BY c.date_fin ASC`,
    [jours]
  );
  return result.rows;
}

async function addDocument({ contratId, typeDocument, filename, path: filePath, mimeType, tailleOctets, importePar }) {
  const result = await pool.query(
    `INSERT INTO documents_contrat (contrat_id, type_document, filename, path, mime_type, taille_octets, importe_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [contratId, typeDocument || 'contrat_original', filename, filePath, mimeType || null, tailleOctets || null, importePar]
  );
  return result.rows[0];
}

async function findDocumentsByContrat(contratId) {
  const result = await pool.query(
    `SELECT * FROM documents_contrat WHERE contrat_id = $1 ORDER BY importe_le DESC`,
    [contratId]
  );
  return result.rows;
}

async function findDocumentById(id) {
  const result = await pool.query(
    `SELECT dc.*, c.personnel_id
     FROM documents_contrat dc
     JOIN contrats c ON c.id = dc.contrat_id
     WHERE dc.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createContrat, findById, findByPersonnel, updateDecision, marquerRenouvele,
  markNotified, findEcheancesDansNJours, addDocument, findDocumentsByContrat, findDocumentById,
  markExpirationNotified, findExpiresNonNotifies,
};