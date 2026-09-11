const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function sendNotification(target, title, message, type) {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ target, title, message, type }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Échec de l'envoi");
  return data;
}

export async function getMyNotifications() {
  const res = await fetch(`${API_URL}/notifications/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.notifications;
}

export async function markNotificationAsRead(id) {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec');
  return data;
}