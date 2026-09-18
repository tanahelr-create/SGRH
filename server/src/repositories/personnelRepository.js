const pool = require('../config/db');

async function create({ matricule, nom, prenom, email, role, fonction, corps, grade, poste, service, direction, telephone, typeContrat, dateRecrutement, dateEcheanceContrat, contratPermanent, indice, chapitreIb, categorieId }) {
  const result = await pool.query(
    `INSERT INTO personnel (matricule, nom, prenom, email, role, fonction, corps, grade, poste, service, direction, telephone, type_contrat, date_recrutement, date_echeance_contrat, contrat_permanent, indice, chapitre_ib, categorie_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     RETURNING *`,
    [
      matricule, nom, prenom, email, role, fonction || null, corps || null, grade || null, poste || null,
      service || null, direction || null, telephone || null, typeContrat || null,
      dateRecrutement || null, contratPermanent ? null : (dateEcheanceContrat || null), !!contratPermanent,
      indice || null, chapitreIb || null, categorieId || null,
    ]
  );
  return result.rows[0];
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT p.*, cp.code AS categorie_code, cp.appellation AS categorie_appellation,
       COALESCE(
         (SELECT resp.nom || ' ' || resp.prenom FROM services s JOIN personnel resp ON resp.id = s.responsable_personnel_id WHERE s.nom = p.service AND resp.id != p.id),
         (SELECT resp.nom || ' ' || resp.prenom FROM directions d JOIN personnel resp ON resp.id = d.responsable_personnel_id WHERE d.nom = p.direction AND resp.id != p.id)
       ) AS responsable_hierarchique
     FROM personnel p
     LEFT JOIN categories_professionnelles cp ON cp.id = p.categorie_id
     JOIN users u ON u.personnel_id = p.id WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

async function updatePhoto(id, photoPath) {
  const result = await pool.query(
    `UPDATE personnel SET photo_profil = $2 WHERE id = $1 RETURNING *`,
    [id, photoPath]
  );
  return result.rows[0] || null;
}

async function findByMatricule(matricule) {
  const result = await pool.query(`SELECT * FROM personnel WHERE matricule = $1`, [matricule]);
  return result.rows[0] || null;
}

async function findByEmailRaw(email) {
  const result = await pool.query(`SELECT * FROM personnel WHERE email = $1`, [email]);
  return result.rows[0] || null;
}

async function isLinkedToUser(personnelId) {
  const result = await pool.query(`SELECT id FROM users WHERE personnel_id = $1`, [personnelId]);
  return result.rows.length > 0;
}

async function findLinkedUserId(personnelId) {
  const result = await pool.query(`SELECT id FROM users WHERE personnel_id = $1`, [personnelId]);
  return result.rows[0]?.id || null;
}

async function listAll() {
  const result = await pool.query(
    `SELECT p.*, (u.id IS NOT NULL) AS a_un_compte, cp.code AS categorie_code, cp.appellation AS categorie_appellation
     FROM personnel p
     LEFT JOIN users u ON u.personnel_id = p.id
     LEFT JOIN categories_professionnelles cp ON cp.id = p.categorie_id
     ORDER BY p.nom NULLS LAST, p.matricule`
  );
  return result.rows;
}

async function findByIdRaw(id) {
  const result = await pool.query(`SELECT * FROM personnel WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function listWithoutAccount() {
  const result = await pool.query(
    `SELECT p.* FROM personnel p
     LEFT JOIN users u ON u.personnel_id = p.id
     WHERE u.id IS NULL
     ORDER BY p.nom NULLS LAST, p.matricule`
  );
  return result.rows;
}

async function rechargeAnnuelleSiNecessaire(personnelId) {
  const anneeActuelle = new Date().getFullYear();
  const result = await pool.query(
    `UPDATE personnel
     SET solde_conges = solde_conges + 30, derniere_recharge_annee = $2
     WHERE id = $1 AND (derniere_recharge_annee IS NULL OR derniere_recharge_annee < $2)
     RETURNING *`,
    [personnelId, anneeActuelle]
  );
  return result.rows[0] || null;
}

async function getSolde(personnelId) {
  const result = await pool.query(`SELECT solde_conges FROM personnel WHERE id = $1`, [personnelId]);
  return result.rows[0]?.solde_conges ?? 0;
}

async function debiterSolde(personnelId, jours) {
  const result = await pool.query(
    `UPDATE personnel SET solde_conges = solde_conges - $2 WHERE id = $1 RETURNING solde_conges`,
    [personnelId, jours]
  );
  return result.rows[0]?.solde_conges ?? 0;
}

async function crediterSolde(personnelId, jours) {
  const result = await pool.query(
    `UPDATE personnel SET solde_conges = solde_conges + $2 WHERE id = $1 RETURNING solde_conges`,
    [personnelId, jours]
  );
  return result.rows[0]?.solde_conges ?? 0;
}

async function findChefDeServiceUser(service, excludeUserId) {
  const result = await pool.query(
    `SELECT u.id AS user_id FROM personnel p
     JOIN users u ON u.personnel_id = p.id
     WHERE p.service = $1 AND p.fonction = 'Chef de service' AND u.id != $2 AND u.status = 'active'
     LIMIT 1`,
    [service, excludeUserId]
  );
  return result.rows[0]?.user_id || null;
}

async function findResponsableDirectionUser(direction, excludeUserId) {
  const result = await pool.query(
    `SELECT u.id AS user_id FROM personnel p
     JOIN users u ON u.personnel_id = p.id
     WHERE p.direction = $1 AND p.fonction = 'Responsable/Directeur' AND u.id != $2 AND u.status = 'active'
     LIMIT 1`,
    [direction, excludeUserId]
  );
  return result.rows[0]?.user_id || null;
}

async function findEquipeParService(service, excludeUserId) {
  const result = await pool.query(
    `SELECT ud.id, ud.email, ud.nom, ud.prenom, ud.role, ud.fonction, ud.matricule,
            EXISTS (
              SELECT 1 FROM conges c
              WHERE c.user_id = ud.id AND c.status = 'approuvee'
                AND CURRENT_DATE BETWEEN c.date_debut AND c.date_fin
            ) AS en_conge
     FROM user_details ud
     WHERE ud.service = $1 AND ud.id != $2 AND ud.status = 'active'
     ORDER BY ud.nom NULLS LAST`,
    [service, excludeUserId]
  );
  return result.rows;
}

async function findEquipeParDirection(direction, excludeUserId) {
  const result = await pool.query(
    `SELECT ud.id, ud.email, ud.nom, ud.prenom, ud.role, ud.fonction, ud.matricule, ud.service,
            EXISTS (
              SELECT 1 FROM conges c
              WHERE c.user_id = ud.id AND c.status = 'approuvee'
                AND CURRENT_DATE BETWEEN c.date_debut AND c.date_fin
            ) AS en_conge
     FROM user_details ud
     WHERE ud.direction = $1 AND ud.id != $2 AND ud.status = 'active'
     ORDER BY ud.nom NULLS LAST`,
    [direction, excludeUserId]
  );
  return result.rows;
}

async function updateInfosPersonnelles(personnelId, { telephone, adresse, situationFamiliale, dateNaissance, sexe, lieuNaissance, nationalite, datePriseFonction }) {
  const result = await pool.query(
    `UPDATE personnel
     SET telephone = $2, adresse = $3, situation_familiale = $4,
         date_naissance = $5, sexe = $6, lieu_naissance = $7, nationalite = $8, date_prise_fonction = $9
     WHERE id = $1 RETURNING *`,
    [
      personnelId, telephone || null, adresse || null, situationFamiliale || null,
      dateNaissance || null, sexe || null, lieuNaissance || null, nationalite || null, datePriseFonction || null,
    ]
  );
  return result.rows[0];
}

async function updateFiche(id, {
  nom, prenom, email, corps, grade, poste, service, direction, telephone, typeContrat,
  dateRecrutement, dateEcheanceContrat, contratPermanent, classe, echelon, indice, chapitreIb, categorieId,
}) {
  const result = await pool.query(
    `UPDATE personnel SET
       nom = $2, prenom = $3, email = $4, corps = $5, grade = $6, poste = $7, service = $8, direction = $9,
       telephone = $10, type_contrat = $11, date_recrutement = $12,
       date_echeance_contrat = $13, contrat_permanent = $14, classe = $15, echelon = $16, indice = $17, chapitre_ib = $18,
       categorie_id = $19
     WHERE id = $1 RETURNING *`,
    [
      id, nom || null, prenom || null, email, corps || null, grade || null, poste || null,
      service || null, direction || null, telephone || null, typeContrat || null,
      dateRecrutement || null, contratPermanent ? null : (dateEcheanceContrat || null), !!contratPermanent,
      classe || null, echelon || null, indice || null, chapitreIb || null, categorieId || null,
    ]
  );
  return result.rows[0];
}

module.exports = {
  create, findByUserId, updatePhoto, findByMatricule, findByEmailRaw, isLinkedToUser, findLinkedUserId,
  listAll, findByIdRaw, listWithoutAccount,
  rechargeAnnuelleSiNecessaire, getSolde, debiterSolde, crediterSolde,
  findChefDeServiceUser, findResponsableDirectionUser,
  findEquipeParService, findEquipeParDirection,
  updateInfosPersonnelles, updateFiche,
};