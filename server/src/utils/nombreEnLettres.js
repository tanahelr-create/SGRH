// Nombres en toutes lettres (français) pour les documents officiels : « quinze »,
// « deux cent vingt-neuf ». Jusqu'à 999 999 ; les jours de congé sont des multiples de 0,5.
const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze',
  'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const DIZAINES = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

function moinsDeCent(n) {
  if (n < 20) return UNITES[n];
  if (n < 70) {
    const base = DIZAINES[Math.floor(n / 10)];
    const u = n % 10;
    if (u === 0) return base;
    return u === 1 ? `${base} et un` : `${base}-${UNITES[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${UNITES[n - 60]}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${UNITES[n - 80]}`;
}

function moinsDeMille(n) {
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c === 0) return moinsDeCent(r);
  const centaines = c === 1 ? 'cent' : `${UNITES[c]} cent`;
  if (r === 0) return c === 1 ? 'cent' : `${UNITES[c]} cents`;
  return `${centaines} ${moinsDeCent(r)}`;
}

// Entier positif ou nul.
function nombreEnLettres(n) {
  if (!Number.isInteger(n) || n < 0 || n > 999999) throw new Error('Nombre hors limites');
  if (n < 1000) return moinsDeMille(n);
  const milliers = Math.floor(n / 1000);
  const reste = n % 1000;
  const debut = milliers === 1 ? 'mille' : `${moinsDeMille(milliers)} mille`;
  return reste === 0 ? debut : `${debut} ${moinsDeMille(reste)}`;
}

// « quinze jours », « un jour », « vingt-sept jours et demi ». Les autres fractions
// (non prévues par le droit à 2,5 j/mois) sont écrites en chiffres.
function joursEnLettres(n) {
  const nombre = Number(n);
  const entier = Math.floor(nombre);
  const fraction = Math.round((nombre - entier) * 10) / 10;
  if (fraction === 0) return `${nombreEnLettres(entier)} jour${entier > 1 ? 's' : ''}`;
  if (fraction === 0.5) return entier === 0 ? 'un demi-jour' : `${nombreEnLettres(entier)} jour${entier > 1 ? 's' : ''} et demi`;
  return `${String(nombre).replace('.', ',')} jours`;
}

module.exports = { nombreEnLettres, joursEnLettres };
