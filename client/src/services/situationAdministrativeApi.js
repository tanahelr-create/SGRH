const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchTypesSituation() {
  const res = await fetch(`${API_URL}/situations-administratives/types`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.types;
}

export async function getSituationsForPersonnel(personnelId) {
  const res = await fetch(`${API_URL}/situations-administratives/${personnelId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function getMesSituations() {
  const res = await fetch(`${API_URL}/situations-administratives/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function addSituation(personnelId, data, file) {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
  if (file) formData.append('justificatif', file);

  const res = await fetch(`${API_URL}/situations-administratives/${personnelId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Échec de l'ajout");
  return result;
}

export async function updateSituation(id, data) {
  const res = await fetch(`${API_URL}/situations-administratives/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Échec de la modification');
  return result.situation;
}

export async function deleteSituation(id) {
  const res = await fetch(`${API_URL}/situations-administratives/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la suppression');
  return data;
}