const pool = require('../config/db');

async function create({ matricule, nom, prenom, email, role, fonction, corps, grade, service, direction, telephone, typeContrat }) {
  const result = await pool.query(
    `INSERT INTO personnel (matricule, nom, prenom, email, role, fonction, corps, grade, service, direction, telephone, type_contrat)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [matricule, nom, prenom, email, role, fonction || null, corps || null, grade || null, service || null, direction || null, telephone || null, typeContrat || null]
  );
  return result.rows[0];
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT p.* FROM personnel p JOIN users u ON u.personnel_id = p.id WHERE u.id = $1`,
    [userId]
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

async function listAll() {
  const result = await pool.query(
    `SELECT p.*, (u.id IS NOT NULL) AS a_un_compte
     FROM personnel p LEFT JOIN users u ON u.personnel_id = p.id
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

module.exports = {
  create, findByUserId, findByMatricule, findByEmailRaw, isLinkedToUser,
  listAll, findByIdRaw, listWithoutAccount,
};