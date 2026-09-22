// Gestion des directions et services par la RH (base rh_mahajanga, données jetables :
// noms préfixés "TEST ORG", personnel matricule 9996xx, supprimés en fin de test).
const test = require('node:test');
const assert = require('node:assert');
const pool = require('../src/config/db');
const organisationService = require('../src/services/organisationService');
const organisationRepository = require('../src/repositories/organisationRepository');

const PREFIX = `TEST ORG ${process.pid}`;
let compteurPersonnel = 0;
const acteurId = null; // activity_log.user_id est nullable (SET NULL), suffisant pour ces tests

async function creerPersonnelRattache({ direction = null, service = null } = {}) {
  compteurPersonnel += 1;
  const matricule = `9996${String(compteurPersonnel).padStart(2, '0')}`;
  await pool.query(
    `INSERT INTO personnel (matricule, email, nom, prenom, direction, service) VALUES ($1, $2, 'Test', 'Org', $3, $4)`,
    [matricule, `org${compteurPersonnel}_${process.pid}@example.test`, direction, service]
  );
}

test.after(async () => {
  await pool.query(`DELETE FROM personnel WHERE matricule LIKE '9996%'`);
  await pool.query(`DELETE FROM activity_log WHERE description LIKE '%${PREFIX}%'`);
  await pool.query(`DELETE FROM services WHERE nom LIKE '${PREFIX}%'`);
  await pool.query(`DELETE FROM directions WHERE nom LIKE '${PREFIX}%'`);
  await pool.end();
});

test('création : direction puis service rattaché', async () => {
  const direction = await organisationService.creerDirection(`${PREFIX} Direction A`, acteurId);
  assert.strictEqual(direction.nom, `${PREFIX} Direction A`);
  assert.strictEqual(direction.responsable_personnel_id, null);

  const service = await organisationService.creerService(`${PREFIX} Service A1`, direction.id, acteurId);
  assert.strictEqual(service.direction_id, direction.id);

  const trace = await pool.query(`SELECT action_type FROM activity_log WHERE description LIKE $1 ORDER BY id DESC LIMIT 1`, [`%${PREFIX} Service A1%`]);
  assert.strictEqual(trace.rows[0].action_type, 'organisation_service_cree');
});

test('création : nom vide, trop long, ou direction inexistante -> erreurs claires', async () => {
  await assert.rejects(organisationService.creerDirection('   ', acteurId), /requis/);
  await assert.rejects(organisationService.creerDirection('x'.repeat(151), acteurId), /150 caractères/);
  await assert.rejects(organisationService.creerService(`${PREFIX} Orpheline`, 999999999, acteurId), (e) => e.status === 404);
  await assert.rejects(organisationService.creerService('   ', 1, acteurId), /requis/);
});

test('création : doublon refusé proprement (409), pas une erreur SQL brute', async () => {
  const d = await organisationService.creerDirection(`${PREFIX} Direction B`, acteurId);
  await assert.rejects(organisationService.creerDirection(`${PREFIX} Direction B`, acteurId), (e) => e.status === 409 && /existe déjà|déjà ce nom/.test(e.message));
  await organisationService.creerService(`${PREFIX} Service B1`, d.id, acteurId);
  await assert.rejects(organisationService.creerService(`${PREFIX} Service B1`, d.id, acteurId), (e) => e.status === 409);
});

test('suppression : une direction avec des services encore rattachés est refusée', async () => {
  const d = await organisationService.creerDirection(`${PREFIX} Direction C`, acteurId);
  await organisationService.creerService(`${PREFIX} Service C1`, d.id, acteurId);
  await assert.rejects(organisationService.supprimerDirection(d.id, acteurId), (e) => e.status === 409 && /service\(s\)/.test(e.message));
  assert.ok(await organisationRepository.findDirectionById(d.id)); // rien n'a été supprimé
});

test('suppression : un service ou une direction référencés par du personnel sont refusés', async () => {
  const d = await organisationService.creerDirection(`${PREFIX} Direction D`, acteurId);
  const s = await organisationService.creerService(`${PREFIX} Service D1`, d.id, acteurId);
  await creerPersonnelRattache({ service: `${PREFIX} Service D1` });

  await assert.rejects(organisationService.supprimerService(s.id, acteurId), (e) => e.status === 409 && /personne\(s\)/.test(e.message));
  assert.ok(await organisationRepository.findServiceById(s.id));

  // La direction reste bloquée par le service, indépendamment du personnel.
  await assert.rejects(organisationService.supprimerDirection(d.id, acteurId), (e) => e.status === 409);
});

test('suppression : sans dépendance, la direction et son service disparaissent bien', async () => {
  const d = await organisationService.creerDirection(`${PREFIX} Direction E`, acteurId);
  const s = await organisationService.creerService(`${PREFIX} Service E1`, d.id, acteurId);

  await organisationService.supprimerService(s.id, acteurId);
  assert.strictEqual(await organisationRepository.findServiceById(s.id), null);

  await organisationService.supprimerDirection(d.id, acteurId);
  assert.strictEqual(await organisationRepository.findDirectionById(d.id), null);

  const trace = await pool.query(`SELECT action_type FROM activity_log WHERE description LIKE $1 ORDER BY id DESC LIMIT 1`, [`%${PREFIX} Direction E%`]);
  assert.strictEqual(trace.rows[0].action_type, 'organisation_direction_supprimee');
});

test('suppression : identifiant invalide ou inexistant', async () => {
  await assert.rejects(organisationService.supprimerDirection('abc', acteurId), (e) => e.status === 400);
  await assert.rejects(organisationService.supprimerDirection(999999999, acteurId), (e) => e.status === 404);
  await assert.rejects(organisationService.supprimerService('abc', acteurId), (e) => e.status === 400);
  await assert.rejects(organisationService.supprimerService(999999999, acteurId), (e) => e.status === 404);
});
