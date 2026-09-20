// Tests unitaires du jeton signé des QR d'avis (sans base de données).
const test = require('node:test');
const assert = require('node:assert');

process.env.QR_SECRET = process.env.QR_SECRET || 'secret-de-test';
const { creerToken, lireToken, genererQrAvis } = require('../src/services/verificationService');

test('jeton : aller-retour, l\'identifiant est retrouvé', () => {
  assert.strictEqual(lireToken(creerToken(42)), 42);
});

test('jeton falsifié, tronqué ou mal formé : refusé', () => {
  const t = creerToken(42);
  const [payload, sig] = t.split('.');
  const autre = Buffer.from('avis:43').toString('base64url');
  assert.strictEqual(lireToken(`${autre}.${sig}`), null); // autre identifiant, même signature
  assert.strictEqual(lireToken(`${payload}.${sig.slice(0, -1)}A`), null); // signature altérée
  assert.strictEqual(lireToken(payload), null);
  assert.strictEqual(lireToken(''), null);
  assert.strictEqual(lireToken(null), null);
  assert.strictEqual(lireToken(`${t}.x`), null);
  assert.strictEqual(lireToken('n\'importe.quoi'), null);
});

test('le QR ne contient que l\'adresse signée (aucune donnée personnelle)', async () => {
  const { url, dataUrl } = await genererQrAvis(7);
  assert.match(url, /\/verification\/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.match(dataUrl, /^data:image\/png;base64,/);
  assert.strictEqual(lireToken(url.split('/verification/')[1]), 7);
});

test('sans QR_SECRET : indisponible proprement (503), sans planter', async () => {
  const sauvegarde = process.env.QR_SECRET;
  delete process.env.QR_SECRET;
  try {
    const { qrDisponible, verifierAvis } = require('../src/services/verificationService');
    assert.strictEqual(qrDisponible(), false);
    assert.throws(() => creerToken(1), (e) => e.status === 503);
    await assert.rejects(verifierAvis('abc.def'), (e) => e.status === 503); // jeton bien formé : la clé est requise
    await assert.rejects(verifierAvis('n-importe-quoi'), (e) => e.status === 404); // mal formé : rejeté avant même la clé
  } finally {
    process.env.QR_SECRET = sauvegarde;
  }
});
