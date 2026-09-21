// Saisie des soldes d'ouverture par année, à partir des états de congé officiels
// (congés d'avant le SGRH). Opération RH explicite, tracée dans le journal d'activité.
//
// Cohérence : après la saisie, solde_conges = total des restants par année. Un ancien
// solde d'ouverture non ventilé (ex. le 30 posé par le DEFAULT historique) est REMPLACÉ,
// uniquement si l'appelant le confirme explicitement (ancien -> nouveau affichés).
const pool = require('../config/db');
const personnelRepository = require('../repositories/personnelRepository');
const congeSuiviRepository = require('../repositories/congeSuiviRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const congeDroitsService = require('./congeDroitsService');

class OuvertureError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const arrondi = (n) => Math.round(n * 10) / 10;

function dateValide(valeur) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valeur || ''));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function joursInclus(debut, fin) {
  return Math.round((Date.parse(fin) - Date.parse(debut)) / 86400000) + 1;
}

function valider(payload) {
  const lignes = payload?.lignes;
  if (!Array.isArray(lignes) || lignes.length === 0) throw new OuvertureError('Au moins une année de droit est requise.');
  const anneeMax = new Date().getFullYear();
  const vues = new Set();
  return lignes.map((l, i) => {
    const n = i + 1;
    const annee = Number(l.annee);
    if (!Number.isInteger(annee) || annee < 1950 || annee > anneeMax) throw new OuvertureError(`Ligne ${n} : année invalide.`);
    if (vues.has(annee)) throw new OuvertureError(`Ligne ${n} : l'année ${annee} est saisie deux fois.`);
    vues.add(annee);
    const droit = Number(l.droit);
    if (!Number.isFinite(droit) || droit < 0 || droit > 999.9) throw new OuvertureError(`Ligne ${n} : droit invalide.`);
    const conges = (l.conges || []).map((c) => {
      if (!dateValide(c.dateDebut) || !dateValide(c.dateFin) || c.dateFin < c.dateDebut) {
        throw new OuvertureError(`Ligne ${n} : dates de congé pris invalides (AAAA-MM-JJ, fin après début).`);
      }
      const jours = c.jours === undefined || c.jours === '' ? joursInclus(c.dateDebut, c.dateFin) : Number(c.jours);
      if (!Number.isFinite(jours) || jours <= 0) throw new OuvertureError(`Ligne ${n} : nombre de jours pris invalide.`);
      return { dateDebut: c.dateDebut, dateFin: c.dateFin, jours, lieuJouissance: c.lieuJouissance ? String(c.lieuJouissance).slice(0, 150) : null };
    });
    const pris = conges.reduce((t, c) => t + c.jours, 0);
    if (pris > droit) throw new OuvertureError(`Ligne ${n} : les jours pris (${pris}) dépassent le droit (${droit}).`);
    return {
      annee, droit,
      libellePeriode: l.libellePeriode ? String(l.libellePeriode).slice(0, 20) : null,
      reference: l.reference ? String(l.reference).slice(0, 255) : null,
      conges,
    };
  });
}

async function getSuivi(personnelIdRaw) {
  const personnelId = Number(personnelIdRaw);
  if (!Number.isInteger(personnelId) || personnelId < 1 || personnelId > 2147483647) throw new OuvertureError('Identifiant du personnel invalide.');
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new OuvertureError('Fiche personnel introuvable', 404);
  const userId = await personnelRepository.findLinkedUserId(personnelId);
  const lignes = await congeSuiviRepository.restantsParAnnee(personnelId, userId || -1);
  const solde = Number(personnel.solde_conges);
  const restantVentile = lignes.reduce((t, l) => t + l.restant, 0);
  // Congés d'avant le SGRH, avec l'indication « décision déjà établie ».
  const historiques = await congeSuiviRepository.historiquesPersonnel(personnelId);
  const decisions = await pool.query(
    `SELECT donnees->>'historiqueId' AS id FROM documents_generes WHERE type_document = 'decision_conge' AND personnel_id = $1 AND donnees ? 'historiqueId'`,
    [personnelId]
  );
  const decidees = new Set(decisions.rows.map((r) => r.id));
  // Solde disponible et détail de l'année, calculés comme dans le dossier de la personne
  // (GET /conges/solde) : la RH et l'agent voient exactement les mêmes chiffres.
  const disponible = await congeDroitsService.getSoldeDetails(userId, personnelId);
  return {
    ...disponible,
    soldeEnregistre: solde,
    derniereRechargeAnnee: personnel.derniere_recharge_annee,
    historiques: historiques.map((h) => ({ ...h, decisionEtablie: decidees.has(String(h.id)) })),
    lignes,
    soldeOuvertureNonVentile: arrondi(solde - restantVentile),
  };
}

async function saisirOuverture(personnelIdRaw, payload, acteurId) {
  const personnelId = Number(personnelIdRaw);
  if (!Number.isInteger(personnelId) || personnelId < 1 || personnelId > 2147483647) throw new OuvertureError('Identifiant du personnel invalide.');
  const lignes = valider(payload);

  const resultat = await pool.withTransaction(async (client) => {
    const fiche = await personnelRepository.lockPourRecharge(personnelId, client);
    if (!fiche) throw new OuvertureError('Fiche personnel introuvable', 404);
    const userId = await personnelRepository.findLinkedUserId(personnelId);

    const avant = await congeSuiviRepository.restantsParAnnee(personnelId, userId || -1, client);
    const anneesExistantes = new Set(avant.map((l) => l.annee));
    const conflits = lignes.filter((l) => anneesExistantes.has(l.annee)).map((l) => l.annee);
    if (conflits.length > 0) {
      throw new OuvertureError(`Un droit existe déjà pour l'année ${conflits.join(', ')} : il ne peut pas être remplacé.`, 409);
    }

    const soldeAvant = Number(fiche.solde_conges);
    const nonVentileAvant = arrondi(soldeAvant - avant.reduce((t, l) => t + l.restant, 0));
    if (nonVentileAvant !== 0 && payload.remplacerSoldeOuverture !== true) {
      throw new OuvertureError(
        `Cette fiche a un solde d'ouverture non ventilé de ${nonVentileAvant} jour(s) : il sera remplacé par le détail par année. Confirmez le remplacement pour continuer.`,
        409
      );
    }

    for (const l of lignes) {
      await congeSuiviRepository.insererDroitAnnuel({
        personnelId, annee: l.annee, droit: l.droit, source: 'OUVERTURE',
        libellePeriode: l.libellePeriode, reference: l.reference, createdBy: acteurId,
      }, client);
      for (const c of l.conges) {
        await congeSuiviRepository.insererHistorique({
          personnelId, annee: l.annee, dateDebut: c.dateDebut, dateFin: c.dateFin, jours: c.jours,
          reference: l.reference, lieuJouissance: c.lieuJouissance, createdBy: acteurId,
        }, client);
      }
    }

    const apres = await congeSuiviRepository.restantsParAnnee(personnelId, userId || -1, client);
    const soldeApres = arrondi(apres.reduce((t, l) => t + l.restant, 0));
    // Les années saisies sont couvertes : la recharge automatique reprend après la dernière.
    const anneeMax = Math.max(...lignes.map((l) => l.annee));
    const marque = Math.max(fiche.derniere_recharge_annee ?? 0, anneeMax);
    await client.query(
      `UPDATE personnel SET solde_conges = $2, derniere_recharge_annee = $3 WHERE id = $1`,
      [personnelId, soldeApres, marque]
    );
    return { soldeAvant, soldeApres, annees: lignes.map((l) => l.annee).sort((a, b) => a - b) };
  });

  await activityLogRepository.create(
    acteurId, 'conge_ouverture_saisie',
    `Soldes d'ouverture saisis pour la fiche #${personnelId} (années ${resultat.annees.join(', ')}) : solde ${resultat.soldeAvant} -> ${resultat.soldeApres}`
  );
  return { ...resultat, suivi: await getSuivi(personnelId) };
}

module.exports = { OuvertureError, getSuivi, saisirOuverture };
