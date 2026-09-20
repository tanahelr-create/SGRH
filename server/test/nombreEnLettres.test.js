const test = require('node:test');
const assert = require('node:assert');
const { nombreEnLettres, joursEnLettres } = require('../src/utils/nombreEnLettres');

test('nombres en lettres', () => {
  const attendu = {
    0: 'zéro', 1: 'un', 15: 'quinze', 21: 'vingt et un', 22: 'vingt-deux', 30: 'trente', 34: 'trente-quatre',
    60: 'soixante', 71: 'soixante et onze', 77: 'soixante-dix-sept', 80: 'quatre-vingts', 81: 'quatre-vingt-un',
    91: 'quatre-vingt-onze', 99: 'quatre-vingt-dix-neuf', 100: 'cent', 101: 'cent un', 200: 'deux cents',
    229: 'deux cent vingt-neuf', 380: 'trois cent quatre-vingts', 1000: 'mille', 2026: 'deux mille vingt-six',
  };
  for (const [n, lettres] of Object.entries(attendu)) assert.strictEqual(nombreEnLettres(Number(n)), lettres, n);
});

test('jours en lettres : pluriel et demi-journées', () => {
  assert.strictEqual(joursEnLettres(15), 'quinze jours');
  assert.strictEqual(joursEnLettres(1), 'un jour');
  assert.strictEqual(joursEnLettres(0), 'zéro jour');
  assert.strictEqual(joursEnLettres(229), 'deux cent vingt-neuf jours');
  assert.strictEqual(joursEnLettres(27.5), 'vingt-sept jours et demi');
  assert.strictEqual(joursEnLettres(0.5), 'un demi-jour');
  assert.strictEqual(joursEnLettres(12.3), '12,3 jours');
});

test('nombre invalide refusé', () => {
  assert.throws(() => nombreEnLettres(-1));
  assert.throws(() => nombreEnLettres(1.5));
});
