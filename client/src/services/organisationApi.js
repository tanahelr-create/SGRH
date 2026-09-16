const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchDirections() {
  const res = await fetch(`${API_URL}/organisation/directions`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement des directions');
  return data.directions;
}

export async function fetchServices(directionId) {
  const url = directionId
    ? `${API_URL}/organisation/services?directionId=${directionId}`
    : `${API_URL}/organisation/services`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement des services');
  return data.services;
}