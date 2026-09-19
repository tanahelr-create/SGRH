import { makeApiError } from '../utils/apiError';
import { downloadAuthenticatedFile } from './fileDownload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function telechargerJustificatifEvenement(id, filename) {
  return downloadAuthenticatedFile(`${API_URL}/carriere/evenements/${id}/justificatif`, filename);
}

export async function telechargerDocumentDiplome(id, filename) {
  return downloadAuthenticatedFile(`${API_URL}/carriere/diplomes/${id}/document`, filename);
}

export async function getCarriere(personnelId) {
  const res = await fetch(`${API_URL}/carriere/${personnelId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data;
}

export async function getMaCarriere() {
  const res = await fetch(`${API_URL}/carriere/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data;
}

function toFormData(fields, file, fileFieldName) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (file) formData.append(fileFieldName, file);
  return formData;
}

export async function addEvenement(personnelId, data, file) {
  const res = await fetch(`${API_URL}/carriere/${personnelId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: toFormData(data, file, 'justificatif'),
  });
  const result = await res.json();
  if (!res.ok) throw makeApiError(res, result, "Échec de l'ajout");
  return result;
}

export async function updateEvenement(id, data, file) {
  const res = await fetch(`${API_URL}/carriere/evenements/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: toFormData(data, file, 'justificatif'),
  });
  const result = await res.json();
  if (!res.ok) throw makeApiError(res, result, 'Échec de la modification');
  return result;
}

export async function deleteEvenement(id) {
  const res = await fetch(`${API_URL}/carriere/evenements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Échec de la suppression');
  return data;
}

export async function addDiplome(personnelId, data, file) {
  const res = await fetch(`${API_URL}/carriere/${personnelId}/diplomes`, {
    method: 'POST',
    headers: authHeaders(),
    body: toFormData(data, file, 'document'),
  });
  const result = await res.json();
  if (!res.ok) throw makeApiError(res, result, "Échec de l'ajout du diplôme");
  return result;
}

export async function deleteDiplome(id) {
  const res = await fetch(`${API_URL}/carriere/diplomes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Échec de la suppression du diplôme');
  return data;
}

export async function getEcheancesProches() {
  const res = await fetch(`${API_URL}/carriere/echeances`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw makeApiError(res, data, 'Erreur de chargement');
  return data.echeances;
}