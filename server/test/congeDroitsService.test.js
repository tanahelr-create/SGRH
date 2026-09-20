// Tests unitaires du calcul des droits à congé (sans base de données).
const test = require('node:test');
const assert = require('node:assert');
const {
  moisCompletsDansAnnee, calculerDroitsConges, calculerCreditsManquants,
} = require('../src/services/congeDroitsService');

const droits = (dateRecrutement, annee) => calculerDroitsConges({ date_recrutement: dateRecrutement }, annee);

test('mois complets seulement : 1er du mois compte, mois entamé non compté', () => {
  assert.strictEqual(moisCompletsDansAnnee('2026-01-01', 2026), 12);
  assert.strictEqual(moisCompletsDansAnnee('2026-06-01', 2026), 7);
  assert.strictEqual(moisCompletsDansAnnee('2026-06-15', 2026), 6);
  assert.strictEqual(moisCompletsDansAnnee('2026-12-01', 2026), 1);
  assert.strictEqual(moisCompletsDansAnnee('2026-12-15', 2026), 0);
  assert.strictEqual(moisCompletsDansAnnee('2026-12-31', 2026), 0);
});

test('2,5 jours par mois, valeurs décimales', () => {
  assert.strictEqual(droits('2026-01-01', 2026), 30);
  assert.strictEqual(droits('2026-06-01', 2026), 17.5);
  assert.strictEqual(droits('2026-08-01', 2026), 12.5);
  assert.strictEqual(droits('2026-12-01', 2026), 2.5);
  assert.strictEqual(droits('2026-11-01', 2026), 5);
  assert.strictEqual(droits('2026-09-15', 2026), 7.5); // oct + nov + déc
  assert.strictEqual(droits('2026-02-01', 2026), 27.5);
});

test('année antérieure au recrutement : 0 ; année postérieure : 30 ; année bissextile sans effet', () => {
  assert.strictEqual(droits('2027-01-01', 2026), 0);
  assert.strictEqual(droits('2020-03-10', 2026), 30);
  assert.strictEqual(droits('2024-02-29', 2024), 25); // mars à décembre = 10 mois
});

test('date de recrutement absente : aucun calcul, solde d\'ouverture conservé', () => {
  assert.strictEqual(droits(null, 2026), null);
  const c = calculerCreditsManquants({ date_recrutement: null, derniere_recharge_annee: null }, 2026);
  assert.deepStrictEqual([c.total, c.annees.length, c.nouvelleMarque, c.dateManquante], [0, 0, null, true]);
});

test('déjà crédité pour l\'année : rien à ajouter (pas de double recharge)', () => {
  const c = calculerCreditsManquants({ date_recrutement: '2020-01-01', derniere_recharge_annee: 2026 }, 2026);
  assert.strictEqual(c.total, 0);
  assert.strictEqual(c.nouvelleMarque, null);
});

test('années manquantes toutes récupérées (2025 + 2026 + 2027 = 90)', () => {
  const c = calculerCreditsManquants({ date_recrutement: '2020-01-01', derniere_recharge_annee: 2024 }, 2027);
  assert.deepStrictEqual(c.annees.map((a) => a.annee), [2025, 2026, 2027]);
  assert.strictEqual(c.total, 90);
  assert.strictEqual(c.nouvelleMarque, 2027);
});

test('sans repère : départ à la plus tardive de l\'année de recrutement et d\'entrée dans le SGRH', () => {
  // recruté en 2015, fiche créée en 2026 : pas de rattrapage rétroactif avant 2026
  let c = calculerCreditsManquants({ date_recrutement: '2015-06-03', derniere_recharge_annee: null, created_at: new Date(2026, 8, 19) }, 2026);
  assert.deepStrictEqual(c.annees.map((a) => a.annee), [2026]);
  assert.strictEqual(c.total, 30);
  // recruté et créé la même année, en juin : prorata (mois complets)
  c = calculerCreditsManquants({ date_recrutement: '2026-06-01', derniere_recharge_annee: null, created_at: new Date(2026, 8, 19) }, 2026);
  assert.strictEqual(c.total, 17.5);
  // recrutement dans le futur : 0 mais repère posé
  c = calculerCreditsManquants({ date_recrutement: '2027-03-01', derniere_recharge_annee: null, created_at: new Date(2026, 8, 19) }, 2026);
  assert.strictEqual(c.total, 0);
  assert.strictEqual(c.nouvelleMarque, 2026);
});
