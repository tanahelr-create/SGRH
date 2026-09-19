const avancementService = require('./avancementService');
const notificationService = require('./notificationService');

// Signale au RH une nouvelle alerte d'échéance d'avancement d'échelon. Ne modifie
// jamais personnel/carriere_evenements : uniquement une notification + la ligne
// alertes_avancement déjà créée par avancementService.scannerAlertes (prompt §26).
async function verifierEcheancesAvancement() {
  const nouvelles = await avancementService.scannerAlertes();

  for (const { alerte, personnel } of nouvelles) {
    try {
      await notificationService.sendNotification(
        null,
        { type: 'role', role: 'ADMIN_RH' },
        'Avancement d\'échelon à traiter',
        `${personnel.prenom} ${personnel.nom} (matricule ${personnel.matricule}) a atteint l'échéance théorique d'avancement d'échelon le ${new Date(alerte.date_echeance_theorique).toLocaleDateString('fr-FR')}.`,
        'echeance',
        `/admin/carriere?personnel=${personnel.id}`
      );
    } catch (err) {
      console.error(`Échec de la notification d'avancement d'échelon pour la fiche #${personnel.id}`, err);
    }
  }

  return nouvelles.length;
}

let intervalHandle = null;

// Même stratégie que contratEcheanceJob : pas de planificateur externe dans ce
// projet, la vérification tourne tant que le process serveur est en vie.
function start() {
  if (intervalHandle) return;
  setTimeout(() => verifierEcheancesAvancement().catch((err) => console.error('Erreur vérification échéances avancement', err)), 45 * 1000);
  intervalHandle = setInterval(() => verifierEcheancesAvancement().catch((err) => console.error('Erreur vérification échéances avancement', err)), 24 * 60 * 60 * 1000);
}

module.exports = { start, verifierEcheancesAvancement };
