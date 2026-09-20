const pool = require('../config/db');

// Insère le droit d'une année ; ne fait rien (renvoie null) si la ligne existe déjà,
// ce qui empêche de créditer deux fois la même année.
async function insererDroitAnnuel({ personnelId, annee, droit, source = 'CALCULE', libellePeriode = null, reference = null, createdBy = null }, db = pool) {
  const result = await db.query(
    `INSERT INTO conges_droits_annuels (personnel_id, annee, droit, source, libelle_periode, reference, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (personnel_id, annee) DO NOTHING
     RETURNING *`,
    [personnelId, annee, droit, source, libellePeriode, reference, createdBy]
  );
  return result.rows[0] || null;
}

// Droit, jours pris (congés non refusés + congés historiques d'avant le SGRH) et restant
// de chaque année, du plus ancien au plus récent.
async function restantsParAnnee(personnelId, userId, db = pool) {
  const result = await db.query(
    `SELECT d.annee, d.libelle_periode, d.droit::float8 AS droit,
            (COALESCE((SELECT SUM(ci.jours) FROM conges_imputations ci JOIN conges c ON c.id = ci.conge_id
                       WHERE c.user_id = $2 AND c.status <> 'refusee' AND ci.annee = d.annee), 0)
             + COALESCE((SELECT SUM(h.jours) FROM conges_historiques h
                         WHERE h.personnel_id = d.personnel_id AND h.annee = d.annee), 0))::float8 AS pris
     FROM conges_droits_annuels d WHERE d.personnel_id = $1 ORDER BY d.annee`,
    [personnelId, userId]
  );
  return result.rows.map((r) => ({ ...r, restant: r.droit - r.pris }));
}

async function insererImputations(congeId, imputations, db = pool) {
  for (const { annee, jours } of imputations) {
    await db.query(`INSERT INTO conges_imputations (conge_id, annee, jours) VALUES ($1, $2, $3)`, [congeId, annee, jours]);
  }
}

async function setSnapshotSolde(congeId, soldeAvant, soldeApres, db = pool) {
  await db.query(`UPDATE conges SET solde_avant = $2, solde_apres = $3 WHERE id = $1`, [congeId, soldeAvant, soldeApres]);
}

// Congés (non refusés) imputés aux droits, avec leurs dates (texte AAAA-MM-JJ : pas de
// décalage de fuseau). `annee` NULL = solde d'ouverture non ventilé.
async function imputationsDetaillees(userId, db = pool) {
  const result = await db.query(
    `SELECT ci.annee, ci.jours::float8 AS jours, c.id AS conge_id, c.date_debut::text AS date_debut, c.date_fin::text AS date_fin
     FROM conges_imputations ci JOIN conges c ON c.id = ci.conge_id
     WHERE c.user_id = $1 AND c.status <> 'refusee'
     ORDER BY ci.annee NULLS FIRST, c.date_debut`,
    [userId]
  );
  return result.rows;
}

async function historiquesPersonnel(personnelId, db = pool) {
  const result = await db.query(
    `SELECT id, annee, jours::float8 AS jours, date_debut::text AS date_debut, date_fin::text AS date_fin, reference, lieu_jouissance
     FROM conges_historiques WHERE personnel_id = $1 ORDER BY annee, date_debut`,
    [personnelId]
  );
  return result.rows;
}

async function insererHistorique({ personnelId, annee, dateDebut, dateFin, jours, reference = null, lieuJouissance = null, createdBy = null }, db = pool) {
  const result = await db.query(
    `INSERT INTO conges_historiques (personnel_id, annee, date_debut, date_fin, jours, reference, lieu_jouissance, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [personnelId, annee, dateDebut, dateFin, jours, reference, lieuJouissance, createdBy]
  );
  return result.rows[0];
}

async function findHistoriqueById(id, db = pool) {
  const result = await db.query(
    `SELECT id, personnel_id, annee, jours::float8 AS jours, date_debut::text AS date_debut, date_fin::text AS date_fin, lieu_jouissance
     FROM conges_historiques WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  insererDroitAnnuel, restantsParAnnee, insererImputations, setSnapshotSolde,
  imputationsDetaillees, historiquesPersonnel, insererHistorique, findHistoriqueById,
};
