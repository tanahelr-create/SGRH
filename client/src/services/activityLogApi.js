const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getActivityLog(limit = 50) {
  const token = localStorage.getItem('rh_token');
  const res = await fetch(`${API_URL}/activity-log?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.logs;
}