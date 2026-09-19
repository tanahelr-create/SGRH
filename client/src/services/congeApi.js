import { makeApiError } from '../utils/apiError';
import { downloadAuthenticatedFile } from './fileDownload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function telechargerJustificatifConge(id, filename) {
  return downloadAuthenticatedFile(`${API_URL}/conges/${id}/justificatif`, filename);
}

export async function createDemande(data) {
  const res = await fetch(`${API_URL}/conges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw makeApiError(res, result, "Échec de l'envoi");
  return result;
}

export async function uploadJustificatif(id, file) {
  const formData = new FormData();
  formData.append('justificatif', file);
  const res = await fetch(`${API_URL}/conges/${id}/justificatif`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, "Échec de l'envoi du justificatif");
  return data;
}

export async function getMyDemandes() {
  const res = await fetch(`${API_URL}/conges/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demandes;
}

export async function getPendingDemandes() {
  const res = await fetch(`${API_URL}/conges/pending`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demandes;
}

export async function getPendingEquipe() {
  const res = await fetch(`${API_URL}/conges/pending-equipe`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demandes;
}

export async function reviewIntermediaire(id, decision, avis) {
  const res = await fetch(`${API_URL}/conges/${id}/review-intermediaire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ decision, avis }),
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Échec');
  return data;
}

export async function getRecentDemandes() {
  const res = await fetch(`${API_URL}/conges/recent`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demandes;
}

export async function getCalendarDemandes(year, month) {
  const res = await fetch(`${API_URL}/conges/calendar?year=${year}&month=${month}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demandes;
}

export async function reviewDemande(id, decision, avisChefService) {
  const res = await fetch(`${API_URL}/conges/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ decision, avisChefService }),
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Échec');
  return data;
}

export async function getDemandeDetails(id) {
  const res = await fetch(`${API_URL}/conges/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.demande;
}