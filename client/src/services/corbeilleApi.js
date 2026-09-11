const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function listCorbeille() {
  const res = await fetch(`${API_URL}/corbeille`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.items;
}

export async function restoreFromCorbeille(id) {
  const res = await fetch(`${API_URL}/corbeille/${id}/restaurer`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la restauration');
  return data;
}

export async function deletePermanently(id) {
  const res = await fetch(`${API_URL}/corbeille/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la suppression');
  return data;
}