const test = require('node:test');
const assert = require('node:assert');
const { creerLimiteur } = require('../src/middlewares/rateLimit');

function appeler(limiteur, ip) {
  const res = {
    statusCode: 200, headers: {}, corps: null,
    set(k, v) { this.headers[k] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.corps = b; return this; },
  };
  let suivi = false;
  limiteur({ ip }, res, () => { suivi = true; });
  return { res, suivi };
}

test('au-delà du maximum : 429 JSON avec Retry-After, sans appeler la suite', () => {
  const l = creerLimiteur({ fenetreMs: 60000, max: 3, message: 'stop' });
  for (let i = 0; i < 3; i += 1) assert.strictEqual(appeler(l, '1.1.1.1').suivi, true);
  const { res, suivi } = appeler(l, '1.1.1.1');
  assert.strictEqual(suivi, false);
  assert.strictEqual(res.statusCode, 429);
  assert.deepStrictEqual(res.corps, { message: 'stop' });
  assert.ok(Number(res.headers['Retry-After']) >= 1);
});

test('chaque adresse a son propre compteur', () => {
  const l = creerLimiteur({ fenetreMs: 60000, max: 1 });
  assert.strictEqual(appeler(l, 'a').suivi, true);
  assert.strictEqual(appeler(l, 'a').suivi, false);
  assert.strictEqual(appeler(l, 'b').suivi, true);
});

test('la fenêtre expirée remet le compteur à zéro', async () => {
  const l = creerLimiteur({ fenetreMs: 30, max: 1 });
  assert.strictEqual(appeler(l, 'x').suivi, true);
  assert.strictEqual(appeler(l, 'x').suivi, false);
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(appeler(l, 'x').suivi, true);
});
