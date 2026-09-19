const pool = require('../config/db');

async function listGrilles({ regime } = {}) {
  const result = await pool.query(
    `SELECT * FROM grilles_indiciaires WHERE ($1::varchar IS NULL OR regime = $1) ORDER BY date_debut_validite DESC`,
    [regime || null]
  );
  return result.rows;
}

async function findGrilleById(id) {
  const result = await pool.query(`SELECT * FROM grilles_indiciaires WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

// Grilles actives à une date donnée pour un régime. Peut légitimement retourner
// plusieurs lignes si deux grilles se chevauchent : c'est au service appelant
// de décider (jamais un choix arbitraire silencieux ici).
async function findGrillesActivesAt(regime, dateEffet) {
  const result = await pool.query(
    `SELECT * FROM grilles_indiciaires
     WHERE regime = $1 AND actif = true
       AND date_debut_validite <= $2
       AND (date_fin_validite IS NULL OR date_fin_validite >= $2)
     ORDER BY date_debut_validite DESC`,
    [regime, dateEffet]
  );
  return result.rows;
}

// Utilisée par resolveIndice : correspondance EXACTE sur chaque dimension (y compris
// NULL = "cette dimension ne s'applique pas à ce régime"), jamais un filtre optionnel —
// on ne veut jamais qu'un cadre non précisé matche silencieusement une ligne qui, elle,
// a un cadre défini.
async function findLignes({ grilleId, cadre, echelle, categorie, corps, classe, echelon, dateEffet }) {
  const result = await pool.query(
    `SELECT * FROM lignes_grille_indiciaire
     WHERE grille_id = $1 AND actif = true
       AND classe = $2 AND echelon = $3
       AND cadre IS NOT DISTINCT FROM $4
       AND echelle IS NOT DISTINCT FROM $5
       AND categorie IS NOT DISTINCT FROM $6
       AND corps IS NOT DISTINCT FROM $7
       AND date_debut_validite <= $8
       AND (date_fin_validite IS NULL OR date_fin_validite >= $8)
     ORDER BY date_debut_validite DESC`,
    [grilleId, classe, echelon, cadre || null, echelle || null, categorie || null, corps || null, dateEffet]
  );
  return result.rows;
}

async function findLigneById(id) {
  const result = await pool.query(`SELECT * FROM lignes_grille_indiciaire WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function rechercherLignes({ regime, classe, echelon, cadre, echelle, categorie }) {
  const result = await pool.query(
    `SELECT l.*, g.code AS grille_code, g.nom AS grille_nom, g.regime
     FROM lignes_grille_indiciaire l
     JOIN grilles_indiciaires g ON g.id = l.grille_id
     WHERE l.actif = true AND g.actif = true
       AND ($1::varchar IS NULL OR g.regime = $1)
       AND ($2::varchar IS NULL OR l.classe = $2)
       AND ($3::integer IS NULL OR l.echelon = $3)
       AND ($4::varchar IS NULL OR l.cadre = $4)
       AND ($5::varchar IS NULL OR l.echelle = $5)
       AND ($6::varchar IS NULL OR l.categorie = $6)
     ORDER BY g.regime, l.classe, l.echelon, l.categorie NULLS LAST, l.cadre NULLS LAST`,
    [regime || null, classe || null, echelon || null, cadre || null, echelle || null, categorie || null]
  );
  return result.rows;
}

async function createLigne(data) {
  const result = await pool.query(
    `INSERT INTO lignes_grille_indiciaire (
       grille_id, cadre, echelle, categorie, corps, classe, echelon, indice,
       code_grille_affichage, source_texte, source_article, date_debut_validite, date_fin_validite
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      data.grilleId, data.cadre || null, data.echelle || null, data.categorie || null, data.corps || null,
      data.classe, data.echelon, data.indice, data.codeGrilleAffichage || null,
      data.sourceTexte, data.sourceArticle || null, data.dateDebutValidite, data.dateFinValidite || null,
    ]
  );
  return result.rows[0];
}

module.exports = {
  listGrilles, findGrilleById, findGrillesActivesAt, findLignes, findLigneById, rechercherLignes, createLigne,
};
