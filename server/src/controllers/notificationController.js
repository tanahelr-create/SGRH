const notificationService = require('../services/notificationService');

async function send(req, res) {
  const { target, title, message, type } = req.body;
  if (!target || !title || !message) {
    return res.status(400).json({ message: 'target, title et message sont requis' });
  }
  try {
    const notifications = await notificationService.sendNotification(
      req.user.id, target, title, message, type
    );
    return res.status(201).json({ message: 'Notification(s) envoyée(s)', count: notifications.length });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function myNotifications(req, res) {
  const notifications = await notificationService.getMyNotifications(req.user.id);
  return res.status(200).json({ notifications });
}

async function markRead(req, res) {
  const notif = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!notif) return res.status(404).json({ message: 'Notification introuvable' });
  return res.status(200).json({ notification: notif });
}

async function markAllRead(req, res) {
  const count = await notificationService.markAllAsRead(req.user.id);
  return res.status(200).json({ message: 'Notifications marquées comme lues', count });
}

module.exports = { send, myNotifications, markRead, markAllRead };