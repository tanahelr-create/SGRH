const pool = require('../config/db');

async function getAll() {
  const result = await pool.query(`SELECT key, value FROM site_settings`);
  const settings = {};
  result.rows.forEach((row) => { settings[row.key] = row.value; });
  return settings;
}

async function updateOne(key, value) {
  const result = await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *`,
    [key, value]
  );
  return result.rows[0];
}

module.exports = { getAll, updateOne };