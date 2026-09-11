const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function getCarriere(personnelId) {
  const res = await fetch(`${API_URL}/carriere/${personnelId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function getMaCarriere() {
  const res = await fetch(`${API_URL}/carriere/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function addEvenement(personnelId, data) {
  const res = await fetch(`${API_URL}/carriere/${personnelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Échec de l'ajout");
  return result;
}

export async function getEcheancesProches() {
  const res = await fetch(`${API_URL}/carriere/echeances`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.echeances;
}