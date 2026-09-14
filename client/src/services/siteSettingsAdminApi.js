const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getSiteSettings() {
  const res = await fetch(`${API_URL}/site-settings`);
  const data = await res.json();
  return data.settings;
}

export async function updateSiteSetting(key, value) {
  const token = localStorage.getItem('rh_token');
  const res = await fetch(`${API_URL}/site-settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ key, value }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la mise à jour');
  return data;
}