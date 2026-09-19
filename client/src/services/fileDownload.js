import { makeApiError, makeNetworkError } from '../utils/apiError';

// Télécharge un fichier depuis une route authentifiée (Authorization: Bearer),
// contrairement à un simple <a href> qui ne peut pas porter ce header — nécessaire
// depuis que les pièces jointes (justificatifs, diplômes, documents RH) ne sont
// plus servies publiquement via /uploads (voir server/src/utils/secureFileServing.js).
export async function downloadAuthenticatedFile(url, filename) {
  const token = localStorage.getItem('rh_token');
  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) {
    throw makeNetworkError(err);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw makeApiError(res, data, 'Échec du téléchargement');
  }
  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename || 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}
