// Données figées (snapshot) des documents de congé : décision d'octroi et état de congé.
// Le document imprimé reste identique même si le solde ou la fiche évoluent ensuite.
const congeRepository = require('../repositories/congeRepository');
const congeSuiviRepository = require('../repositories/congeSuiviRepository');
const personnelRepository = require('../repositories/personnelRepository');
const carriereRepository = require('../repositories/carriereRepository');
const userRepository = require('../repositories/userRepository');
const pool = require('../config/db');
const { nombreEnLettres, joursEnLettres } = require('../utils/nombreEnLettres');

function ymd(valeur) {
  const d = valeur instanceof Date ? valeur : new Date(valeur);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function jourSuivant(isoDate) {
  const [y, m, j] = isoDate.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, j + 1));
  return d.toISOString().slice(0, 10);
}

function gradeAffiche({ grade, classe, echelon }) {
  if (grade) return grade;
  return [classe, echelon ? `Échelon ${echelon}` : null].filter(Boolean).join(', ') || null;
}

// Position actuelle (fiche) et position précédente (avant le dernier changement de
// carrière enregistré). Le SGRH n'historise ni la catégorie ni le chapitre budgétaire :
// ces deux champs reprennent la valeur actuelle dans les deux blocs.
function positions(personnel, categorie, evenements) {
  const actuelle = {
    iM: personnel.matricule,
    budget: personnel.chapitre_ib || null,
    corps: categorie || null,
    grade: gradeAffiche(personnel),
    fonction: personnel.fonction || null,
    indice: personnel.indice || null,
  };
  const avecPosition = (evenements || [])
    .filter((e) => e.grade || e.classe || e.echelon || e.indice || e.fonction)
    .sort((a, b) => String(b.date_effet || b.date_evenement).localeCompare(String(a.date_effet || a.date_evenement)) || b.id - a.id);
  const precedent = avecPosition[1];
  const ancienne = precedent
    ? {
      ...actuelle,
      grade: gradeAffiche(precedent) || actuelle.grade,
      fonction: precedent.fonction || actuelle.fonction,
      indice: precedent.indice || actuelle.indice,
    }
    : { ...actuelle };
  return { ancienne, nouvelle: actuelle };
}

// Éléments propres au congé à l'origine de la décision : un congé annuel APPROUVÉ du
// SGRH (`congeId`) ou un congé d'avant le SGRH saisi à l'ouverture des soldes
// (`historiqueId`) — cas d'une décision établie a posteriori pour un congé déjà pris.
async function chargerCongeSource(source, personnelId) {
  if (source?.historiqueId !== undefined && source?.historiqueId !== null) {
    const id = Number(source.historiqueId);
    if (!Number.isInteger(id) || id < 1) throw new Error('Congé historique invalide pour la décision');
    const h = await congeSuiviRepository.findHistoriqueById(id);
    if (!h) throw new Error('Congé historique introuvable');
    if (Number(h.personnel_id) !== Number(personnelId)) throw new Error("Ce congé n'appartient pas à ce personnel");
    const personnel = await personnelRepository.findByIdRaw(personnelId);
    const categorie = personnel.categorie_id
      ? (await pool.query('SELECT appellation FROM categories_professionnelles WHERE id = $1', [personnel.categorie_id])).rows[0]?.appellation
      : null;
    return {
      cle: { historiqueId: id },
      nom: personnel.nom, prenom: personnel.prenom, categorie,
      service: personnel.service || personnel.direction || null,
      jours: h.jours, dateDebut: h.date_debut, dateFin: h.date_fin, dateReprise: null,
      lieu: h.lieu_jouissance || null,
      annees: [h.annee], soldeAnterieur: false,
    };
  }

  const id = Number(source?.congeId);
  if (!Number.isInteger(id) || id < 1) throw new Error('Congé invalide pour la décision');
  const conge = await congeRepository.findByIdWithDetails(id);
  if (!conge) throw new Error('Congé introuvable');
  const user = await userRepository.findById(conge.user_id);
  if (!user || Number(user.personnel_id) !== Number(personnelId)) throw new Error("Ce congé n'appartient pas à ce personnel");
  if (conge.type_conge !== 'Congé annuel') throw new Error("Une décision d'octroi ne concerne que le congé annuel");
  if (conge.status !== 'approuvee') throw new Error("Le congé doit être approuvé avant d'établir la décision");
  return {
    cle: { congeId: id },
    nom: conge.nom, prenom: conge.prenom, categorie: conge.categorie,
    service: conge.service || conge.direction || null,
    jours: Number(conge.nombre_jours), dateDebut: ymd(conge.date_debut), dateFin: ymd(conge.date_fin),
    dateReprise: conge.date_reprise_service ? ymd(conge.date_reprise_service) : null,
    lieu: conge.lieu_jouissance || null,
    annees: (conge.imputations || []).filter((i) => i.annee !== null).map((i) => i.annee),
    soldeAnterieur: (conge.imputations || []).some((i) => i.annee === null),
  };
}

// Décision portant octroi d'une fraction de congé annuel. `db` : client de la
// transaction de génération (unicité par congé, sous verrou).
async function construireDonneesDecision(source, personnelId, db) {
  const c = await chargerCongeSource(source, personnelId);
  const [cleNom, cleValeur] = Object.entries(c.cle)[0];

  const existante = await (db || pool).query(
    `SELECT donnees->>'numero' AS numero FROM documents_generes
     WHERE type_document = 'decision_conge' AND donnees->>'${cleNom}' = $1`,
    [String(cleValeur)]
  );
  if (existante.rows[0]) throw new Error(`Une décision existe déjà pour ce congé (n° ${existante.rows[0].numero})`);

  const personnel = await personnelRepository.findByIdRaw(personnelId);
  const evenements = await carriereRepository.findEvenementsByPersonnel(personnelId);
  const { ancienne, nouvelle } = positions(personnel, c.categorie, evenements);

  return {
    ...c.cle,
    nom: c.nom,
    prenom: c.prenom,
    ancienne,
    nouvelle,
    jours: c.jours,
    joursEnLettres: joursEnLettres(c.jours),
    anneesService: c.annees,
    soldeAnterieur: c.soldeAnterieur,
    lieuJouissance: c.lieu,
    dateDepart: c.dateDebut,
    // Sans date de reprise saisie : lendemain de la fin du congé.
    dateReprise: c.dateReprise || jourSuivant(c.dateFin),
    dateNotification: ymd(new Date()),
    service: c.service,
    ampliation: [
      { destinataire: 'PRESIDENT', mention: 'A titre compte rendu' },
      { destinataire: 'DAAF', mention: 'A titre compte rendu' },
      { destinataire: 'Service Personnel', mention: 'Archives' },
      { destinataire: "Service de l'intéressé(e)", mention: c.service },
      { destinataire: 'Intéressé(e)', mention: 'Pour notification' },
    ],
  };
}

// État de congé : une ligne par année de droit (dates des congés pris, jours pris,
// restant), plus le solde d'ouverture non ventilé. Le total est le solde du personnel.
async function construireDonneesEtat(personnelId, db) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');
  const userId = await personnelRepository.findLinkedUserId(personnelId);

  const restants = await congeSuiviRepository.restantsParAnnee(personnelId, userId || -1, db);
  const imputations = userId ? await congeSuiviRepository.imputationsDetaillees(userId, db) : [];
  const historiques = await congeSuiviRepository.historiquesPersonnel(personnelId, db);

  const lignes = restants.map((r) => ({
    annee: r.annee,
    libellePeriode: r.libelle_periode,
    droit: r.droit,
    conges: [
      ...historiques.filter((h) => h.annee === r.annee).map((h) => ({ dateDebut: h.date_debut, dateFin: h.date_fin, jours: h.jours })),
      ...imputations.filter((i) => i.annee === r.annee).map((i) => ({ dateDebut: i.date_debut, dateFin: i.date_fin, jours: i.jours })),
    ],
    pris: r.pris,
    restant: r.restant,
  }));

  // Ce qui reste du solde stocké une fois retirés les droits ventilés par année.
  const solde = Number(personnel.solde_conges);
  const restantVentile = lignes.reduce((t, l) => t + l.restant, 0);
  const prisNonVentile = imputations.filter((i) => i.annee === null).reduce((t, i) => t + i.jours, 0);
  const restantNonVentile = Math.round((solde - restantVentile) * 10) / 10;
  const ouverture = restantNonVentile !== 0 || prisNonVentile > 0
    ? {
      restant: restantNonVentile,
      pris: prisNonVentile,
      conges: imputations.filter((i) => i.annee === null).map((i) => ({ dateDebut: i.date_debut, dateFin: i.date_fin, jours: i.jours })),
    }
    : null;

  const total = Math.round((restantVentile + (ouverture ? ouverture.restant : 0)) * 10) / 10;
  return {
    nom: personnel.nom,
    prenom: personnel.prenom,
    matricule: personnel.matricule,
    statut: personnel.corps || null,
    fonction: personnel.fonction || null,
    service: personnel.service || personnel.direction || null,
    lignes,
    ouverture,
    total,
    totalEnLettres: joursEnLettres(total),
    totalEnChiffres: total,
    arreteLe: ymd(new Date()),
  };
}

module.exports = { construireDonneesDecision, construireDonneesEtat, positions, nombreEnLettres };
