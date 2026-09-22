const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

async function lireOuErreur(res, messageParDefaut) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || messageParDefaut);
  return data;
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

export async function createDirection(nom) {
  const res = await fetch(`${API_URL}/organisation/directions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ nom }),
  });
  const data = await lireOuErreur(res, 'Échec de la création de la direction');
  return data.direction;
}

export async function deleteDirection(id) {
  const res = await fetch(`${API_URL}/organisation/directions/${id}`, { method: 'DELETE', headers: authHeaders() });
  return lireOuErreur(res, 'Échec de la suppression de la direction');
}

export async function createService(nom, directionId) {
  const res = await fetch(`${API_URL}/organisation/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ nom, directionId }),
  });
  const data = await lireOuErreur(res, 'Échec de la création du service');
  return data.service;
}

export async function deleteService(id) {
  const res = await fetch(`${API_URL}/organisation/services/${id}`, { method: 'DELETE', headers: authHeaders() });
  return lireOuErreur(res, 'Échec de la suppression du service');
}