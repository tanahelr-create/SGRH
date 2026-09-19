const grilleIndiciaireRepository = require('../repositories/grilleIndiciaireRepository');

const CLASSES_VALIDES = ['CLASSE_EXCEPTIONNELLE', 'PRINCIPALAT', 'PREMIERE_CLASSE', 'DEUXIEME_CLASSE'];

// Loi n°2003-011, Art.46 : classe exceptionnelle = 2 échelons, les 3 autres classes = 3
// échelons. Redondant avec le CHECK SQL sur lignes_grille_indiciaire, mais donne un
// message explicite avant même d'interroger la base (prompt §15/§41).
function validateCoherence({ classe, echelon }) {
  if (!CLASSES_VALIDES.includes(classe)) {
    throw new Error(`Classe inconnue : "${classe}". Classes valides : ${CLASSES_VALIDES.join(', ')}.`);
  }
  const echelonNum = Number(echelon);
  if (!Number.isInteger(echelonNum) || echelonNum < 1) {
    throw new Error(`Échelon invalide : "${echelon}".`);
  }
  const maxEchelon = classe === 'CLASSE_EXCEPTIONNELLE' ? 2 : 3;
  if (echelonNum > maxEchelon) {
    throw new Error(`Aucune ligne indiciaire ne correspond à la combinaison cadre/échelle/classe/échelon : la classe "${classe}" ne comporte que ${maxEchelon} échelon(s), l'échelon ${echelonNum} n'existe pas.`);
  }
  return true;
}

// Sépare "950-FOP" en { indiceNum: 950, codeGrille: 'FOP' } sans jamais perdre la
// valeur d'origine côté appelant (prompt §17/§20). codeGrille reste générique :
// aucun sigle n'est supposé en dur.
function parseIndiceAffiche(raw) {
  if (raw === null || raw === undefined) return { indiceNum: null, codeGrille: null };
  const str = String(raw).trim();
  const match = str.match(/^(\d+)\s*-?\s*([A-Za-z]+)?$/);
  if (!match) return { indiceNum: null, codeGrille: null };
  return { indiceNum: Number(match[1]), codeGrille: match[2] || null };
}

function formatDisplay(indice, codeGrille) {
  return codeGrille ? `${indice}-${codeGrille}` : String(indice);
}

// Fonction centrale unique de résolution d'indice (prompt §37) : toute la logique
// "situation administrative -> ligne de grille -> indice" vit ici, jamais dupliquée
// dans un contrôleur ou côté frontend.
async function resolveIndice({ regime, cadre, echelle, categorie, corps, classe, echelon, dateEffet }) {
  if (!regime) throw new Error('Impossible de déterminer l\'indice : régime (statut) manquant.');
  validateCoherence({ classe, echelon });

  const effectiveDate = dateEffet || new Date().toISOString().slice(0, 10);

  const grilles = await grilleIndiciaireRepository.findGrillesActivesAt(regime, effectiveDate);
  if (grilles.length === 0) {
    throw new Error(`Impossible de déterminer l'indice : grille inconnue (aucune grille active pour le régime "${regime}" à la date ${effectiveDate}).`);
  }
  if (grilles.length > 1) {
    throw new Error('Plusieurs grilles sont valides pour cette date : intervention RH nécessaire.');
  }
  const grille = grilles[0];

  const lignes = await grilleIndiciaireRepository.findLignes({
    grilleId: grille.id, cadre, echelle, categorie, corps, classe, echelon, dateEffet: effectiveDate,
  });
  if (lignes.length === 0) {
    throw new Error('Aucune ligne indiciaire ne correspond à la combinaison cadre/échelle/classe/échelon pour cette grille.');
  }
  if (lignes.length > 1) {
    throw new Error('Plusieurs lignes indiciaires correspondent à cette combinaison : intervention RH nécessaire.');
  }
  const ligne = lignes[0];

  return {
    indice: ligne.indice,
    codeGrille: ligne.code_grille_affichage || null,
    display: formatDisplay(ligne.indice, ligne.code_grille_affichage),
    grilleId: grille.id,
    ligneGrilleId: ligne.id,
    classe: ligne.classe,
    echelon: ligne.echelon,
    dateEffet: effectiveDate,
    source: grille.texte_source_principal,
    reference: ligne.source_article || null,
    verified: true,
  };
}

async function listGrilles(regime) {
  return grilleIndiciaireRepository.listGrilles({ regime });
}

async function getGrille(id) {
  const grille = await grilleIndiciaireRepository.findGrilleById(id);
  if (!grille) throw new Error('Grille introuvable');
  return grille;
}

async function rechercherLignes(filtres) {
  return grilleIndiciaireRepository.rechercherLignes(filtres);
}

// Ajout RH d'une ligne de grille (ex. compléter le principalat/1ère/2ème classe une
// fois un texte officiel localisé ou confirmé). Les données réglementaires vivent en
// base, jamais dans le frontend (prompt §29) — ceci est le point d'entrée pour ça.
async function ajouterLigne(data) {
  const grille = await grilleIndiciaireRepository.findGrilleById(data.grilleId);
  if (!grille) throw new Error('Grille introuvable');
  validateCoherence({ classe: data.classe, echelon: data.echelon });
  if (!data.sourceTexte || !data.sourceTexte.trim()) {
    throw new Error('La source réglementaire (source_texte) est obligatoire : aucune valeur d\'indice ne doit être ajoutée sans texte de référence.');
  }
  if (!data.dateDebutValidite) {
    throw new Error('La date de début de validité est obligatoire.');
  }
  if (!Number.isInteger(Number(data.indice)) || Number(data.indice) <= 0) {
    throw new Error('L\'indice doit être un nombre entier positif.');
  }
  return grilleIndiciaireRepository.createLigne(data);
}

// Dérive le régime réglementaire à partir de `personnel.corps`, qui dans ce projet
// sert de fait de statut/régime (EFA/ELD/Fonctionnaire) plutôt que de "corps" au
// sens réglementaire strict (voir README) — décision documentée, pas une supposition
// silencieuse.
function regimeDepuisCorps(corps) {
  if (corps === 'Fonctionnaire') return 'FONCTIONNAIRE';
  if (corps === 'EFA' || corps === 'ELD') return 'AGENT_NON_ENCADRE';
  return null;
}

module.exports = {
  resolveIndice, validateCoherence, parseIndiceAffiche, formatDisplay,
  listGrilles, getGrille, rechercherLignes, ajouterLigne, regimeDepuisCorps, CLASSES_VALIDES,
};
