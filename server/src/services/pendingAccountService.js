const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const { sendAccountConfirmedEmail } = require('../config/mailer');

async function listPending() {
  return userRepository.findPending();
}

async function approve(id, approvedBy) {
  const user = await userRepository.activate(id);
  if (!user) throw new Error('Compte introuvable');

  const fullUser = await userRepository.findById(id);
  if (fullUser?.email) {
    await sendAccountConfirmedEmail(fullUser.email);
  }

  await activityLogRepository.create(approvedBy, 'compte_confirme', `Compte (inscription matricule) confirmé pour l'utilisateur #${id}`);
  return user;
}

async function reject(id, rejectedBy) {
  await userRepository.reject(id);
  await activityLogRepository.create(rejectedBy, 'compte_refuse', `Compte (inscription matricule) refusé pour l'utilisateur #${id}`);
}

module.exports = { listPending, approve, reject };