const userRepository = require('../repositories/userRepository');
const invitationRepository = require('../repositories/invitationRepository');

async function getAdminDashboardStats() {
  const byRole = await userRepository.countByRole();
  const pe = byRole.find((r) => r.role === 'PE')?.count || 0;
  const pat = byRole.find((r) => r.role === 'PAT')?.count || 0;

  const [pendingValidation, newThisMonth] = await Promise.all([
    invitationRepository.countByStatus('soumise'),
    userRepository.countNewThisMonth(),
  ]);

  return {
    totalPersonnel: pe + pat,
    pe,
    pat,
    pendingValidation,
    newThisMonth,
  };
}

module.exports = { getAdminDashboardStats };