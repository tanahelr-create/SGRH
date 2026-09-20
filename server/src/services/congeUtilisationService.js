// Règles de PRISE / UTILISATION du congé, séparées de l'ACQUISITION des droits
// (congeDroitsService : 2,5 jours par mois de service effectif).
//
// Ces règles sont conservées à l'identique du fonctionnement antérieur. Leur base
// juridique par régime n'est pas confirmée :
//  - « 15 jours minimum pour la première demande de congé annuel de l'année » : proche
//    de l'art. 88 du Code du travail (première fraction de 15 jours), applicable aux
//    agents relevant du Code du travail ; aucun texte trouvé ne l'établit pour les
//    fonctionnaires (le régime détaillé relève d'un décret, Loi 2003-011 art. 66,
//    non localisé). Elle s'applique aujourd'hui à tous, sans distinction de corps ;
//  - « congé de paternité : 15 jours maximum » : Loi 2003-011 art. 65.
// Le régime (Fonctionnaire / EFA / ELD) relève du corps ; PE / PAT sont des
// fonctions : aucune de ces règles ne s'appuie sur le rôle PE / PAT.

const JOURS_MINIMUM_PREMIERE_DEMANDE_ANNUELLE = 15;
const JOURS_MAXIMUM_PATERNITE = 15;

function verifierPremiereDemandeAnnuelle({ jours, nbDemandesAnnuellesCetteAnnee }) {
  if (nbDemandesAnnuellesCetteAnnee === 0 && jours < JOURS_MINIMUM_PREMIERE_DEMANDE_ANNUELLE) {
    throw new Error("La première demande de congé annuel de l'année doit être d'au moins 15 jours");
  }
}

function verifierSoldeSuffisant({ jours, solde }) {
  if (jours > solde) {
    throw new Error(`Solde insuffisant : il vous reste ${solde} jour(s) de congé annuel`);
  }
}

function verifierDureePaternite({ jours }) {
  if (jours > JOURS_MAXIMUM_PATERNITE) {
    throw new Error('Le congé de paternité ne peut pas dépasser 15 jours');
  }
}

module.exports = { verifierPremiereDemandeAnnuelle, verifierSoldeSuffisant, verifierDureePaternite };
