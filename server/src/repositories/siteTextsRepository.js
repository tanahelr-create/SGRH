const pool = require('../config/db');

async function getAll() {
  const result = await pool.query(`SELECT key, value, category FROM site_texts ORDER BY category, key`);
  return result.rows;
}

// Lecture d'une seule clé (utilisée côté serveur, ex. messages de connexion), sans passer
// par TextProvider qui n'existe que côté React.
async function getOne(key) {
  const result = await pool.query(`SELECT value FROM site_texts WHERE key = $1`, [key]);
  return result.rows[0]?.value ?? null;
}

// Insère une clé si elle n'existe pas encore (utilisé par le frontend au premier chargement de chaque texte),
// sans jamais écraser une valeur déjà personnalisée par le Superadmin.
async function ensureDefault(key, defaultValue, category) {
  await pool.query(
    `INSERT INTO site_texts (key, value, category) VALUES ($1, $2, $3)
     ON CONFLICT (key) DO NOTHING`,
    [key, defaultValue, category]
  );
}

async function updateOne(key, value) {
  const result = await pool.query(
    `UPDATE site_texts SET value = $2 WHERE key = $1 RETURNING *`,
    [key, value]
  );
  return result.rows[0];
}

module.exports = { getAll, getOne, ensureDefault, updateOne };