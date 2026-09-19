const contratRepository = require('../repositories/contratRepository');
const personnelRepository = require('../repositories/personnelRepository');
const notificationService = require('./notificationService');

// 6 mois avant la date de fin = déclenchement de la NOTIFICATION (Phase 10).
// Ce n'est jamais une date d'effet d'avenant : celle-ci vient toujours de la
// décision saisie par le RH (cf. contratService.finaliserRenouvellement).
const JOURS_AVANT_ECHEANCE = 183;

async function verifierEcheances() {
  const contrats = await contratRepository.findEcheancesDansNJours(JOURS_AVANT_ECHEANCE);

  for (const contrat of contrats) {
    try {
      const destinataireUserId = await personnelRepository.findLinkedUserId(contrat.personnel_id);
      const dateFinFormatee = new Date(contrat.date_fin).toLocaleDateString('fr-FR');

      if (destinataireUserId) {
        await notificationService.sendNotification(
          null,
          { type: 'individual', recipientIds: [destinataireUserId] },
          'Échéance de contrat approchante',
          `Votre contrat arrive à échéance le ${dateFinFormatee}.`,
          'echeance',
          '/mes-contrats'
        );
      }

      await notificationService.sendNotification(
        null,
        { type: 'role', role: 'ADMIN_RH' },
        'Contrat à traiter',
        `Le contrat de ${contrat.prenom} ${contrat.nom} (matricule ${contrat.matricule}) arrive à échéance le ${dateFinFormatee}. Une décision de renouvellement est à prendre.`,
        'echeance',
        `/admin/contrats?personnel=${contrat.personnel_id}`
      );

      // Marqué seulement si tout a réussi : anti-doublon (Phase 10), sans
      // faire disparaître silencieusement un échec d'envoi.
      await contratRepository.markNotified(contrat.id);
    } catch (err) {
      console.error(`Échec de la notification d'échéance pour le contrat #${contrat.id}`, err);
    }
  }

  return contrats.length;
}

// Contrat "actif" dont la date de fin est dépassée sans décision prise : notifie
// une seule fois (anti-doublon via notifie_expiration_le), distinct de l'alerte
// d'échéance à 183 jours qui, elle, prévient en amont.
async function verifierExpirations() {
  const contrats = await contratRepository.findExpiresNonNotifies();

  for (const contrat of contrats) {
    try {
      const destinataireUserId = await personnelRepository.findLinkedUserId(contrat.personnel_id);
      const dateFinFormatee = new Date(contrat.date_fin).toLocaleDateString('fr-FR');

      if (destinataireUserId) {
        await notificationService.sendNotification(
          null,
          { type: 'individual', recipientIds: [destinataireUserId] },
          'Contrat expiré',
          `Votre contrat est arrivé à échéance le ${dateFinFormatee}.`,
          'echeance',
          '/mes-contrats'
        );
      }

      await notificationService.sendNotification(
        null,
        { type: 'role', role: 'ADMIN_RH' },
        'Contrat expiré sans décision',
        `Le contrat de ${contrat.prenom} ${contrat.nom} (matricule ${contrat.matricule}) est arrivé à échéance le ${dateFinFormatee} sans décision de renouvellement.`,
        'echeance',
        `/admin/contrats?personnel=${contrat.personnel_id}`
      );

      await contratRepository.markExpirationNotified(contrat.id);
    } catch (err) {
      console.error(`Échec de la notification d'expiration pour le contrat #${contrat.id}`, err);
    }
  }

  return contrats.length;
}

let intervalHandle = null;

function verifierToutes() {
  return Promise.all([
    verifierEcheances().catch((err) => console.error('Erreur vérification échéances contrats', err)),
    verifierExpirations().catch((err) => console.error('Erreur vérification expirations contrats', err)),
  ]);
}

// Une première vérification peu après le démarrage du serveur, puis toutes
// les 24h. Process unique : pas de vraie planification externe dans ce
// projet, donc cette vérification ne s'exécute que tant que le serveur tourne.
function start() {
  if (intervalHandle) return;
  setTimeout(verifierToutes, 30 * 1000);
  intervalHandle = setInterval(verifierToutes, 24 * 60 * 60 * 1000);
}

module.exports = { start, verifierEcheances, verifierExpirations, JOURS_AVANT_ECHEANCE };