const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

export async function createPersonnel(data) {
  const res = await fetch(`${API_URL}/personnel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Échec de la création');
  return result;
}

export async function listPersonnel() {
  const res = await fetch(`${API_URL}/personnel`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.personnel;
}

export async function listPersonnelWithoutAccount() {
  const res = await fetch(`${API_URL}/personnel/sans-compte`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.personnel;
}

export async function sendRegistrationLink(id) {
  const res = await fetch(`${API_URL}/personnel/${id}/envoyer-lien`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Échec de l'envoi");
  return data;
}

export async function getMyPersonnel() {
  const res = await fetch(`${API_URL}/personnel/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.personnel;
}

export async function updateMyProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await fetch(`${API_URL}/personnel/me/photo`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Échec de l'enregistrement de la photo");
  return data.personnel;
}

export async function getMonEquipe() {
  const res = await fetch(`${API_URL}/personnel/mon-equipe`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function exportPersonnelExcel() {
  const token = localStorage.getItem('rh_token');
  const res = await fetch(`${API_URL}/personnel/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Échec de l'export");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personnel.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function importPersonnelExcel(file) {
  const token = localStorage.getItem('rh_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/personnel/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Échec de l'import");
  return data;
}

export async function getPendingAccounts() {
  const res = await fetch(`${API_URL}/pending-accounts`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data.accounts;
}

export async function approvePendingAccount(id) {
  const res = await fetch(`${API_URL}/pending-accounts/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la validation');
  return data;
}

export async function rejectPendingAccount(id) {
  const res = await fetch(`${API_URL}/pending-accounts/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec du refus');
  return data;
}

export async function updateMesInfos({ telephone, adresse, situationFamiliale, dateNaissance, sexe, lieuNaissance, nationalite, datePriseFonction }) {
  const token = localStorage.getItem('rh_token');
  const res = await fetch(`${API_URL}/personnel/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ telephone, adresse, situationFamiliale, dateNaissance, sexe, lieuNaissance, nationalite, datePriseFonction }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Échec de la mise à jour');
  return data.personnel;
}