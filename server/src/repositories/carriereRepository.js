const pool = require('../config/db');

async function createEvenement({
  personnelId, typeEvenement, description, dateEvenement, dateEffet,
  ancienneSituation, nouvelleSituation, corps, grade, classe, echelon, indice, fonction, affectation,
  motif, referenceDecision, autoriteDecision, observations, justificatifFilename, justificatifPath, createdBy,
  ligneGrilleId, indiceNum, indiceSource,
}) {
  const result = await pool.query(
    `INSERT INTO carriere_evenements (
       personnel_id, type_evenement, description, date_evenement, date_effet,
       ancienne_situation, nouvelle_situation, corps, grade, classe, echelon, indice, fonction, affectation,
       motif, reference_decision, autorite_decision, observations, justificatif_filename, justificatif_path, created_by,
       ligne_grille_id, indice_num, indice_source
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     RETURNING *`,
    [
      personnelId, typeEvenement, description || null, dateEvenement, dateEffet || null,
      ancienneSituation ? JSON.stringify(ancienneSituation) : null,
      nouvelleSituation ? JSON.stringify(nouvelleSituation) : null,
      corps || null, grade || null, classe || null, echelon || null, indice || null, fonction || null, affectation || null,
      motif || null, referenceDecision || null, autoriteDecision || null, observations || null,
      justificatifFilename || null, justificatifPath || null, createdBy,
      ligneGrilleId || null, indiceNum ?? null, indiceSource || 'A_CONFIRMER',
    ]
  );
  return result.rows[0];
}

async function updateEvenement(id, {
  typeEvenement, description, dateEvenement, dateEffet, corps, grade, classe, echelon, indice, fonction, affectation,
  motif, referenceDecision, autoriteDecision, observations, justificatifFilename, justificatifPath, updatedBy,
  ligneGrilleId, indiceNum, indiceSource,
}) {
  const result = await pool.query(
    `UPDATE carriere_evenements SET
       type_evenement = $2, description = $3, date_evenement = $4, date_effet = $5,
       corps = $6, grade = $7, classe = $8, echelon = $9, indice = $10, fonction = $11, affectation = $12,
       motif = $13, reference_decision = $14, autorite_decision = $15, observations = $16,
       justificatif_filename = $17, justificatif_path = $18, updated_by = $19, updated_at = NOW(),
       ligne_grille_id = $20, indice_num = $21, indice_source = $22
     WHERE id = $1 RETURNING *`,
    [
      id, typeEvenement, description || null, dateEvenement, dateEffet || null,
      corps || null, grade || null, classe || null, echelon || null, indice || null, fonction || null, affectation || null,
      motif || null, referenceDecision || null, autoriteDecision || null, observations || null,
      justificatifFilename || null, justificatifPath || null, updatedBy,
      ligneGrilleId || null, indiceNum ?? null, indiceSource || 'A_CONFIRMER',
    ]
  );
  return result.rows[0];
}

async function findEvenementById(id) {
  const result = await pool.query(`SELECT * FROM carriere_evenements WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function deleteEvenement(id) {
  await pool.query(`DELETE FROM carriere_evenements WHERE id = $1`, [id]);
}

async function findEvenementsByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT ce.*, l.code_grille_affichage, l.source_texte AS grille_source_texte, l.source_article AS grille_source_article
     FROM carriere_evenements ce
     LEFT JOIN lignes_grille_indiciaire l ON l.id = ce.ligne_grille_id
     WHERE ce.personnel_id = $1 ORDER BY ce.date_evenement DESC`,
    [personnelId]
  );
  return result.rows;
}

async function findFonctionHistoryByPersonnel(personnelId) {
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

async function createDiplome({ personnelId, intitule, etablissement, anneeObtention, documentFilename, documentPath, createdBy }) {
  const result = await pool.query(
    `INSERT INTO personnel_diplomes (personnel_id, intitule, etablissement, annee_obtention, document_filename, document_path, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [personnelId, intitule, etablissement || null, anneeObtention || null, documentFilename || null, documentPath || null, createdBy]
  );
  return result.rows[0];
}

async function findDiplomesByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT * FROM personnel_diplomes WHERE personnel_id = $1 ORDER BY annee_obtention DESC NULLS LAST, created_at DESC`,
    [personnelId]
  );
  return result.rows;
}

async function findDiplomeById(id) {
  const result = await pool.query(`SELECT * FROM personnel_diplomes WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function deleteDiplome(id) {
  await pool.query(`DELETE FROM personnel_diplomes WHERE id = $1`, [id]);
}

module.exports = {
  createEvenement, updateEvenement, findEvenementById, deleteEvenement, findEvenementsByPersonnel,
  findFonctionHistoryByPersonnel, findEcheancesProches,
  createDiplome, findDiplomesByPersonnel, findDiplomeById, deleteDiplome,
};