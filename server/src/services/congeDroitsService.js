// Source de vérité du calcul des droits à congé annuel.
//
// Règle commune vérifiée dans les textes : 2,5 jours par mois de service effectif
// (Loi 2003-011 art. 64 pour les fonctionnaires ; Loi 2003-044 art. 86 pour les
// travailleurs relevant du Code du travail), soit 30 jours pour une année complète.
//
// Choix retenus (validés) :
//  - seuls les mois calendaires COMPLETS de service comptent : recruté le 1er du mois,
//    ce mois compte ; recruté après le 1er, il ne compte pas ; pas de prorata journalier ;
//  - le reliquat n'est jamais supprimé (le congé peut être cumulé) ;
//  - NON appliqués pour l'instant, à traiter ultérieurement : délai de 12 mois avant
//    jouissance et prescription de 3 ans (Code du travail art. 86 et 88).
const personnelRepository = require('../repositories/personnelRepository');
const congeRepository = require('../repositories/congeRepository');
const congeSuiviRepository = require('../repositories/congeSuiviRepository');
const pool = require('../config/db');

const JOURS_PAR_MOIS = 2.5;
const MOIS_PAR_AN = 12;

// Accepte 'AAAA-MM-JJ[...]' ou un Date (getters locaux : le driver pg construit les
// DATE à minuit local).
function extraireDate(valeur) {
  if (!valeur) return null;
  if (valeur instanceof Date) {
    if (Number.isNaN(valeur.getTime())) return null;
    return { annee: valeur.getFullYear(), mois: valeur.getMonth() + 1, jour: valeur.getDate() };
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valeur));
  return m ? { annee: Number(m[1]), mois: Number(m[2]), jour: Number(m[3]) } : null;
}

// Nombre de mois calendaires complets de service pendant `annee` (0 à 12), ou null
// si la date de recrutement est inconnue.
function moisCompletsDansAnnee(dateRecrutement, annee) {
  const d = extraireDate(dateRecrutement);
  if (!d) return null;
  if (d.annee > annee) return 0;
  if (d.annee < annee) return MOIS_PAR_AN;
  const premierMoisComplet = d.jour === 1 ? d.mois : d.mois + 1;
  return Math.max(0, MOIS_PAR_AN - premierMoisComplet + 1);
}

// Droit acquis pour l'année `annee` (null si la date de recrutement est inconnue).
function calculerDroitsConges(personnel, annee) {
  const mois = moisCompletsDansAnnee(personnel?.date_recrutement, annee);
  return mois === null ? null : mois * JOURS_PAR_MOIS;
}

// Années à créditer et montant total, sans rien écrire.
//  - sans date de recrutement : aucun calcul, le solde actuel reste le solde d'ouverture ;
//  - déjà crédité pour l'année courante : rien à faire ;
//  - sinon on récupère TOUTES les années non créditées : depuis l'année suivant la
//    dernière recharge ou, à défaut de repère, depuis la plus tardive entre l'année de
//    recrutement et l'année d'entrée de la fiche dans le SGRH (pas de rattrapage
//    rétroactif d'avant le suivi).
function calculerCreditsManquants(personnel, anneeCourante) {
  const vide = { annees: [], total: 0, nouvelleMarque: null, dateManquante: false };
  const recrutement = extraireDate(personnel?.date_recrutement);
  if (!recrutement) return { ...vide, dateManquante: true };

  const derniere = personnel.derniere_recharge_annee;
  if (derniere !== null && derniere !== undefined && derniere >= anneeCourante) return vide;

  let debut;
  if (derniere !== null && derniere !== undefined) {
    debut = derniere + 1;
  } else {
    const creation = extraireDate(personnel.created_at);
    debut = Math.max(recrutement.annee, creation ? creation.annee : recrutement.annee);
  }

  const annees = [];
  for (let annee = debut; annee <= anneeCourante; annee += 1) {
    annees.push({ annee, droit: calculerDroitsConges(personnel, annee) });
  }
  const total = annees.reduce((s, a) => s + a.droit, 0);
  return { annees, total, nouvelleMarque: anneeCourante, dateManquante: false };
}

// Applique les crédits manquants, de façon atomique et idempotente : la fiche est
// verrouillée (FOR UPDATE) pendant le calcul, donc deux appels simultanés ne peuvent
// pas créditer deux fois la même année. À appeler dans la transaction de l'appelant
// (client fourni) ou seul (transaction propre).
async function rechargerSiNecessaire(personnelId, db, anneeCourante = new Date().getFullYear()) {
  if (!db) return pool.withTransaction((client) => rechargerSiNecessaire(personnelId, client, anneeCourante));

  const personnel = await personnelRepository.lockPourRecharge(personnelId, db);
  if (!personnel) return { annees: [], total: 0, nouvelleMarque: null, dateManquante: false };

  const credits = calculerCreditsManquants(personnel, anneeCourante);
  if (credits.nouvelleMarque !== null) {
    // Un droit par année dans le suivi annuel ; seul ce qui est réellement inséré est
    // crédité au solde (une année déjà saisie, ex. solde d'ouverture, n'est jamais recomptée).
    let total = 0;
    for (const { annee, droit } of credits.annees) {
      const inserted = await congeSuiviRepository.insererDroitAnnuel({ personnelId, annee, droit }, db);
      if (inserted) total += droit;
    }
    await personnelRepository.appliquerRecharge(personnelId, total, credits.nouvelleMarque, db);
    return { ...credits, total };
  }
  return credits;
}

// Impute `jours` d'un congé annuel sur les droits par année, du plus ancien au plus
// récent. Ce qui ne peut être rattaché à aucune année (solde historique sans détail)
// est imputé à `annee = null` : « solde d'ouverture non ventilé ». À appeler dans la
// transaction de la demande, après le débit du solde.
async function imputerJours(userId, personnelId, congeId, jours, db) {
  const restants = await congeSuiviRepository.restantsParAnnee(personnelId, userId, db);
  let reste = jours;
  const imputations = [];
  for (const r of restants) {
    if (reste <= 0) break;
    const part = Math.min(reste, r.restant);
    if (part > 0) {
      imputations.push({ annee: r.annee, jours: part });
      reste -= part;
    }
  }
  if (reste > 0) imputations.push({ annee: null, jours: reste });
  await congeSuiviRepository.insererImputations(congeId, imputations, db);
  return imputations;
}

// Vue calculée côté serveur pour l'affichage (sans écriture) : le solde disponible
// inclut les crédits qui seraient appliqués à la prochaine demande.
async function getSoldeDetails(userId, personnelId, anneeCourante = new Date().getFullYear()) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) return null;
  const solde = Number(personnel.solde_conges);
  const credits = calculerCreditsManquants(personnel, anneeCourante);
  const soldeDisponible = solde + credits.total;
  const droitsAnnee = calculerDroitsConges(personnel, anneeCourante);
  const joursPrisAnnee = await congeRepository.sommeJoursAnnuelsAnnee(userId, anneeCourante);
  return {
    annee: anneeCourante,
    soldeDisponible,
    droitsAnnee,
    joursPrisAnnee,
    // Part du solde qui provient des années précédentes (null si non calculable).
    reliquat: droitsAnnee === null ? null : soldeDisponible - droitsAnnee + joursPrisAnnee,
    dateRecrutementConnue: !credits.dateManquante,
  };
}

module.exports = {
  JOURS_PAR_MOIS, moisCompletsDansAnnee, calculerDroitsConges, calculerCreditsManquants,
  rechargerSiNecessaire, imputerJours, getSoldeDetails,
};
