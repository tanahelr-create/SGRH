const reclamationRepository = require('../repositories/reclamationRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const notificationService = require('./notificationService');

class ReclamationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ReclamationError';
    this.status = status;
  }
}

async function signaler(auteurId, { sujet, description }) {
  const sujetPropre = String(sujet || '').trim();
  const descriptionPropre = String(description || '').trim();
  if (!sujetPropre) throw new ReclamationError('Le sujet est requis');
  if (sujetPropre.length > 150) throw new ReclamationError('Le sujet ne peut pas dépasser 150 caractères');
  if (!descriptionPropre) throw new ReclamationError('La description est requise');

  const reclamation = await reclamationRepository.create({
    auteurId, sujet: sujetPropre, description: descriptionPropre,
  });
  await activityLogRepository.create(auteurId, 'reclamation_deposee', `Réclamation déposée : "${sujetPropre}"`);

  // Le Superadmin est notifié dès qu'une réclamation est déposée (best-effort : une
  // notification ratée ne doit pas empêcher l'enregistrement de la réclamation elle-même).
  try {
    await notificationService.sendNotification(
      auteurId,
      { type: 'role', role: 'SUPERADMIN' },
      'Nouvelle réclamation',
      `Sujet : ${sujetPropre}`,
      'info',
      null
    );
  } catch (err) {
    console.error('Notification de réclamation non envoyée :', err.message);
  }

  return reclamation;
}

async function mesReclamations(auteurId) {
  return reclamationRepository.findByAuteur(auteurId);
}

async function toutes() {
  return reclamationRepository.listAll();
}

async function traiter(id, traitePar, reponse) {
  const reclamation = await reclamationRepository.findById(id);
  if (!reclamation) throw new ReclamationError('Réclamation introuvable', 404);
  if (reclamation.statut === 'traitee') throw new ReclamationError('Cette réclamation est déjà traitée');

  const reponsePropre = String(reponse || '').trim();
  if (!reponsePropre) throw new ReclamationError('Une réponse est requise pour marquer la réclamation comme traitée');

  const updated = await reclamationRepository.marquerTraitee(id, { traitePar, reponse: reponsePropre });
  await activityLogRepository.create(traitePar, 'reclamation_traitee', `Réclamation "${reclamation.sujet}" traitée`);
  return updated;
}

module.exports = { signaler, mesReclamations, toutes, traiter, ReclamationError };
