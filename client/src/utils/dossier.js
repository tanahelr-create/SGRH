// Règles d'affichage partagées par « Mon dossier » et le tableau de bord personnel :
// contrat actuel, durée restante, libellés. Aucune donnée n'est inventée : tout vient
// des endpoints /me déjà isolés au personnel connecté.

export const STATUT_CONTRAT_LABELS = {
  actif: 'Actif', expire: 'Expiré', renouvele: 'Renouvelé', non_renouvele: 'Non renouvelé', resilie: 'Résilié',
};
export const STATUT_CONTRAT_BADGE = {
  actif: 'approved', renouvele: 'approved', expire: 'rejected', resilie: 'rejected', non_renouvele: 'neutral',
};

// Même seuil que l'alerte d'échéance du backend (contratEcheanceJob : 183 jours, soit 6 mois).
export const SEUIL_ECHEANCE_PROCHE_JOURS = 183;

// Libellés lisibles des classes de la grille indiciaire (valeurs stockées en base).
export const CLASSE_LABELS = {
  CLASSE_EXCEPTIONNELLE: 'Classe exceptionnelle',
  PRINCIPALAT: 'Principalat',
  PREMIERE_CLASSE: 'Première classe',
  DEUXIEME_CLASSE: 'Deuxième classe',
};

export function contratActuel(contrats) {
  if (!contrats?.length) return null;
  return contrats.find((c) => c.statut === 'actif') || contrats[0];
}

// Jours entiers entre aujourd'hui et `dateFin` (négatif si dépassée).
export function joursRestants(dateFin) {
  const diffMs = new Date(dateFin).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / 86400000);
}

// Durée calendaire restante jusqu'à `dateFin` : « 1 an, 2 mois et 5 jours ».
export function dureeRestante(dateFin) {
  const fin = new Date(dateFin);
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  if (fin <= debut) return null;
  let annees = fin.getFullYear() - debut.getFullYear();
  let mois = fin.getMonth() - debut.getMonth();
  let jours = fin.getDate() - debut.getDate();
  if (jours < 0) {
    mois -= 1;
    jours += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
  }
  if (mois < 0) {
    annees -= 1;
    mois += 12;
  }
  const morceaux = [];
  if (annees) morceaux.push(`${annees} an${annees > 1 ? 's' : ''}`);
  if (mois) morceaux.push(`${mois} mois`);
  if (jours) morceaux.push(`${jours} jour${jours > 1 ? 's' : ''}`);
  if (morceaux.length <= 1) return morceaux[0] || null;
  return `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}`;
}

// Part (0 à 100) de la durée du contrat déjà écoulée, ou null si non calculable.
export function progressionContrat(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return null;
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();
  if (!(fin > debut)) return null;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - debut) / (fin - debut)) * 100)));
}

export function formatJours(n) {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toLocaleString('fr-FR')} jour${Number(n) > 1 ? 's' : ''}`;
}

// --- Dates renvoyées par l'API -------------------------------------------------
// Le serveur envoie une date PostgreSQL (jour civil) sous forme d'ISO UTC de minuit local
// (ex. 05/03/1990 -> "1990-03-04T21:00:00.000Z" à Madagascar). Couper la chaîne au 10ᵉ
// caractère donne donc la veille. On relit la date avec les getters LOCAUX du navigateur ;
// une chaîne déjà au format AAAA-MM-JJ (valeur d'un champ date) est prise telle quelle.
function partiesDate(valeur) {
  if (!valeur) return null;
  const texte = String(valeur);
  const simple = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte);
  if (simple) return { y: Number(simple[1]), m: Number(simple[2]), d: Number(simple[3]) };
  const date = new Date(texte);
  if (Number.isNaN(date.getTime())) return null;
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

const deux = (n) => String(n).padStart(2, '0');

// JJ/MM/AAAA, ou `vide` si la date est absente ou invalide.
export function formatDateFr(valeur, vide = 'Non renseigné') {
  const p = partiesDate(valeur);
  return p ? `${deux(p.d)}/${deux(p.m)}/${p.y}` : vide;
}

// AAAA-MM-JJ pour préremplir un <input type="date"> sans décalage.
export function toInputDate(valeur) {
  const p = partiesDate(valeur);
  return p ? `${p.y}-${deux(p.m)}-${deux(p.d)}` : '';
}

// Date locale (minuit) pour les calculs d'ancienneté.
export function dateLocale(valeur) {
  const p = partiesDate(valeur);
  return p ? new Date(p.y, p.m - 1, p.d) : null;
}

// --- Présentation commune du dossier ---
export const roleLabels = { PE: 'Personnel Enseignant', PAT: 'Personnel Administratif et Technique' };

export function present(value) {
  return value === null || value === undefined || value === '' ? 'Non renseigné' : value;
}

// Dates : voir utils/dossier.js (le serveur envoie l'ISO UTC d'un jour local ; les couper
// au 10ᵉ caractère donnait la veille et décalait la date à chaque enregistrement).
export const formatDate = (value) => formatDateFr(value);

export function seniority(date) {
  if (!date) return 'Non renseigné';
  const start = dateLocale(date);
  if (!start || start > new Date()) return 'Non renseigné';
  const today = new Date();
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} an${years !== 1 ? 's' : ''}${months ? ` et ${months} mois` : ''}`;
}


