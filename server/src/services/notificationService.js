const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function resolveRecipientIds(target) {
  if (target.type === 'individual') return target.recipientIds || [];
  if (target.type === 'role') {
    const users = await userRepository.listActive({ role: target.role });
    return users.map((u) => u.id);
  }
  if (target.type === 'fonction') {
    const users = await userRepository.listActive({ fonction: target.fonction });
    return users.map((u) => u.id);
  }
  throw new Error('Type de cible invalide');
}

async function sendNotification(senderId, target, title, message, type) {
  const recipientIds = await resolveRecipientIds(target);
  if (recipientIds.length === 0) throw new Error('Aucun destinataire trouvé pour cette cible');

  const created = [];
  for (const recipientId of recipientIds) {
    created.push(await notificationRepository.create({ senderId, recipientId, title, message, type }));
  }

  await activityLogRepository.create(senderId, 'notification_envoyee', `Notification "${title}" envoyée à ${recipientIds.length} personne(s)`);

  return created;
}

async function getMyNotifications(userId) {
  return notificationRepository.findByRecipient(userId);
}

async function markAsRead(id, userId) {
  return notificationRepository.markAsRead(id, userId);
}

module.exports = { sendNotification, getMyNotifications, markAsRead };