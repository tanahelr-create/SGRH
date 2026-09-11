const pool = require('../config/db');

async function create({ senderId, recipientId, title, message, type }) {
  const result = await pool.query(
    `INSERT INTO notifications (sender_id, recipient_id, title, message, type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [senderId, recipientId, title, message, type || 'info']
  );
  return result.rows[0];
}

async function findByRecipient(recipientId) {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC`,
    [recipientId]
  );
  return result.rows;
}

async function markAsRead(id, recipientId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, recipientId]
  );
  return result.rows[0];
}

module.exports = { create, findByRecipient, markAsRead };