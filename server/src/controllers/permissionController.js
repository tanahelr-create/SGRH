const permissionRepository = require('../repositories/permissionRepository');

async function me(req, res) {
  const keys = await permissionRepository.listForRole(req.user.role);
  return res.status(200).json({ permissions: keys });
}

async function listAll(req, res) {
  const list = await permissionRepository.listAll();
  return res.status(200).json({ permissions: list });
}

async function update(req, res) {
  const { role, permissionId, enabled } = req.body;
  if (!role || !permissionId || typeof enabled !== 'boolean') {
    return res.status(400).json({ message: 'role, permissionId et enabled (booléen) requis' });
  }

  const key = await permissionRepository.getKeyById(permissionId);
  if (role === 'SUPERADMIN' && key === 'manage_permissions' && enabled === false) {
    return res.status(400).json({ message: 'Impossible de retirer cette permission au Superadmin (verrouillage évité)' });
  }

  const result = await permissionRepository.setPermission(role, permissionId, enabled);
  return res.status(200).json({ message: 'Permission mise à jour', result });
}

module.exports = { me, listAll, update };