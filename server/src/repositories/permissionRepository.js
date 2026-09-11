const pool = require('../config/db');

async function isRoleAllowed(role, permissionKey) {
  const result = await pool.query(
    `SELECT rp.enabled FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role = $1 AND p.key = $2`,
    [role, permissionKey]
  );
  return result.rows.length > 0 && result.rows[0].enabled === true;
}

async function listAll() {
  const result = await pool.query(
    `SELECT p.id, p.key, p.label, p.category, rp.role, COALESCE(rp.enabled, false) AS enabled
     FROM permissions p
     CROSS JOIN (VALUES ('ADMIN_RH'), ('SUPERADMIN'), ('PE'), ('PAT')) AS roles(role)
     LEFT JOIN role_permissions rp ON rp.permission_id = p.id AND rp.role = roles.role
     ORDER BY p.category, p.key, roles.role`
  );
  return result.rows;
}

async function setPermission(role, permissionId, enabled) {
  const result = await pool.query(
    `INSERT INTO role_permissions (role, permission_id, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (role, permission_id) DO UPDATE SET enabled = $3
     RETURNING *`,
    [role, permissionId, enabled]
  );
  return result.rows[0];
}

async function listForRole(role) {
  const result = await pool.query(
    `SELECT p.key FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role = $1 AND rp.enabled = true`,
    [role]
  );
  return result.rows.map((r) => r.key);
}

async function getKeyById(permissionId) {
  const result = await pool.query(`SELECT key FROM permissions WHERE id = $1`, [permissionId]);
  return result.rows[0]?.key || null;
}

module.exports = { isRoleAllowed, listAll, setPermission, listForRole, getKeyById };