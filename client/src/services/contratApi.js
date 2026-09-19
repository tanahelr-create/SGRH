const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('rh_token');
  return { Authorization: `Bearer ${token}` };
}

function toFormData(fields, file, fileFieldName) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (file) formData.append(fileFieldName, file);
  return formData;
}

export async function getHistoriquePersonnel(personnelId) {
  const res = await fetch(`${API_URL}/contrats/personnel/${personnelId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function getMesContrats() {
  const res = await fetch(`${API_URL}/contrats/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur de chargement');
  return data;
}

export async function importerContrat(personnelId, data, fichier) {
  const res = await fetch(`${API_URL}/contrats/personnel/${personnelId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: toFormData(data, fichier, 'fichier'),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Échec de l'import du contrat");
  return result.contrat;
}

export async function finaliserRenouvellement(personnelId, contratId, data, fichier) {
  const res = await fetch(`${API_URL}/contrats/personnel/${personnelId}/${contratId}/renouveler`, {
    method: 'POST',
    headers: authHeaders(),
    body: toFormData(data, fichier, 'fichier'),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Échec du renouvellement');
  return result.contrat;
}

export async function ajouterDocument(contratId, fichier, typeDocument) {
  const res = await fetch(`${API_URL}/contrats/${contratId}/documents`, {
    method: 'POST',
    headers: authHeaders(),
    body: toFormData({ typeDocument }, fichier, 'fichier'),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Échec de l'ajout du document");
  return result.document;
}

export async function marquerDecision(contratId, decision, { motif, referenceDecision } = {}) {
  const res = await fetch(`${API_URL}/contrats/${contratId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ decision, motif, referenceDecision }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Échec de l'enregistrement de la décision");
  return result.contrat;
}

export async function telechargerDocumentContrat(documentId, filename) {
  const res = await fetch(`${API_URL}/contrats/documents/${documentId}/fichier`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Échec du téléchargement');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'contrat.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
