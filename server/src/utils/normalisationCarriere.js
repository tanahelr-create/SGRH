// Normalise les variantes d'écriture rencontrées dans les imports Excel RH vers les
// valeurs internes utilisées par la grille indiciaire (prompt §19). La valeur
// d'origine n'est jamais perdue : l'appelant doit continuer à la conserver en plus
// du résultat normalisé (ex. dans le rapport d'import).
const VARIANTES_CLASSE = [
  { normalized: 'CLASSE_EXCEPTIONNELLE', patterns: [/^classe\s*except/i, /^cl\.?\s*exc/i] },
  { normalized: 'PRINCIPALAT', patterns: [/^principalat$/i, /^classe\s*principale$/i] },
  { normalized: 'PREMIERE_CLASSE', patterns: [/^1\s*(ere|ère|e)?\s*classe$/i, /^premi[eè]re\s*classe$/i] },
  { normalized: 'DEUXIEME_CLASSE', patterns: [/^2\s*(eme|ème|e)?\s*classe$/i, /^deuxi[eè]me\s*classe$/i] },
];

function normaliserClasse(raw) {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!str) return null;
  for (const { normalized, patterns } of VARIANTES_CLASSE) {
    if (patterns.some((p) => p.test(str))) return normalized;
  }
  return null; // non reconnu : ne devine pas, laisse "à confirmer" côté appelant
}

function normaliserEchelon(raw) {
  if (raw === null || raw === undefined) return null;
  const match = String(raw).trim().match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

module.exports = { normaliserClasse, normaliserEchelon };
