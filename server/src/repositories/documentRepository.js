const pool = require('../config/db');

const CODES_PAR_TYPE = {
  certificat_administratif: 'CA',
  lettre_confirmation: 'LC',
};

async function genererNumero(typeDocument) {
  const anneeActuelle = new Date().getFullYear();
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM documents_generes
     WHERE type_document = $1 AND EXTRACT(YEAR FROM genere_le) = $2`,
    [typeDocument, anneeActuelle]
  );
  const sequence = result.rows[0].count + 1;
  const code = CODES_PAR_TYPE[typeDocument] || 'DOC';
  return `${sequence}-${code}/${anneeActuelle}/UMG/PR/DAAF/SGRH`;
}

async function create({ personnelId, typeDocument, donnees, generePar }) {
  const result = await pool.query(
    `INSERT INTO documents_generes (personnel_id, type_document, donnees, genere_par)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [personnelId, typeDocument, JSON.stringify(donnees), generePar]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT d.*, p.matricule, p.nom, p.prenom, p.fonction, p.corps, p.grade, p.service, p.direction,
            p.date_recrutement, p.indice, p.chapitre_ib
     FROM documents_generes d JOIN personnel p ON p.id = d.personnel_id
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