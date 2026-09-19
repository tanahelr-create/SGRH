import { makeApiError } from '../utils/apiError';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchParametresCarriere() {
  const res = await fetch(`${API_URL}/parametres-carriere`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.parametres;
}

export async function updateParametreCarriere(cle, valeur) {
  const res = await fetch(`${API_URL}/parametres-carriere/${cle}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ valeur }),
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Échec de la mise à jour');
  return data.parametre;
}