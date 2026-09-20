const pool = require('../config/db');

const CODES_PAR_TYPE = {
  certificat_administratif: 'CA',
  lettre_confirmation: 'LC',
  etat_conge: 'EC',
};

// À appeler dans la transaction de génération (verrou consultatif par type et par
// année) : deux générations simultanées ne peuvent pas obtenir le même numéro.
async function genererNumero(typeDocument, db = pool) {
  const anneeActuelle = new Date().getFullYear();
  const result = await db.query(
    `SELECT COUNT(*)::int AS count FROM documents_generes
     WHERE type_document = $1 AND EXTRACT(YEAR FROM genere_le) = $2`,
    [typeDocument, anneeActuelle]
  );
  const sequence = result.rows[0].count + 1;
  // Décision d'octroi de congé : numérotation du Service du Personnel (N°…/année/UMG/PR/DAAF/PERS).
  if (typeDocument === 'decision_conge') return `${sequence}/${anneeActuelle}/UMG/PR/DAAF/PERS`;
  const code = CODES_PAR_TYPE[typeDocument] || 'DOC';
  return `${sequence}-${code}/${anneeActuelle}/UMG/PR/DAAF/SGRH`;
}

async function create({ personnelId, typeDocument, donnees, generePar }, db = pool) {
  const result = await db.query(
    `INSERT INTO documents_generes (personnel_id, type_document, donnees, genere_par)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [personnelId, typeDocument, JSON.stringify(donnees), generePar]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT d.*, p.matricule, p.nom, p.prenom, p.fonction, p.corps, p.grade, p.service, p.direction,
            p.date_recrutement, p.indice, p.chapitre_ib, p.role, cp.appellation AS categorie
     FROM documents_generes d JOIN personnel p ON p.id = d.personnel_id
     LEFT JOIN categories_professionnelles cp ON cp.id = p.categorie_id
     WHERE d.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByPersonnel(personnelId) {
  const result = await pool.query(
    `SELECT * FROM documents_generes WHERE personnel_id = $1 ORDER BY genere_le DESC`,
    [personnelId]
  );
  return result.rows;
}

module.exports = { create, findById, findByPersonnel, genererNumero };