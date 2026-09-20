const situationAdministrativeRepository = require('../repositories/situationAdministrativeRepository');
const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const notificationRepository = require('../repositories/notificationRepository');
const pool = require('../config/db');

async function listTypes() {
  return situationAdministrativeRepository.listTypes();
}

class SituationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseId(value, label) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > 2147483647) {
    throw new SituationError(`${label} invalide`, 400);
  }
  return Number(value);
}

// Date au format AAAA-MM-JJ et réellement existante (refuse 2026-02-30).
function parseDate(value, label) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!m || d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    throw new SituationError(`${label} invalide (format attendu : AAAA-MM-JJ)`, 400);
  }
  return String(value);
}

function formatFr(isoDate) {
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

async function addSituation(personnelIdRaw, data, createdBy) {
  // 1. Validation pure, avant toute lecture/écriture de l'état.
  const personnelId = parseId(personnelIdRaw, 'Identifiant du personnel');
  const typeSituationId = parseId(data.typeSituationId, 'Type de situation');
  const dateDebut = parseDate(data.dateDebut, 'Date de début');
  const types = await situationAdministrativeRepository.listTypes();
  const type = types.find((t) => t.id === typeSituationId);
  if (!type) throw new SituationError('Type de situation administrative inexistant', 400);

  // 2. Transaction : verrou sur la fiche, vérifications, fermeture, création,
  // notification. Toute erreur annule l'ensemble (rien de partiel en base).
  try {
    return await pool.withTransaction(async (client) => {
      if (!(await situationAdministrativeRepository.lockPersonnel(personnelId, client))) {
        throw new SituationError('Fiche personnel introuvable', 404);
      }

      // Une nouvelle situation est ouverte (sans fin) : elle ne doit ni commencer
      // à la même date qu'une autre, ni recouvrir une période existante.
      const conflits = await situationAdministrativeRepository.findConflicts(personnelId, dateDebut, client);
      if (conflits.some((c) => c.date_debut === dateDebut)) {
        throw new SituationError('Une autre situation administrative existe déjà à cette date.', 409);
      }
      if (conflits.length > 0) {
        const c = conflits[0];
        throw new SituationError(
          `Cette date chevauche une situation administrative existante (du ${formatFr(c.date_debut)}${c.date_fin ? ` au ${formatFr(c.date_fin)}` : ' (en cours)'}).`,
          409
        );
      }

      // La situation ouverte (forcément antérieure, cf. ci-dessus) est fermée la veille.
      const current = await situationAdministrativeRepository.findCurrentOpen(personnelId, client);
      if (current) await situationAdministrativeRepository.closeSituationDayBefore(current.id, dateDebut, client);

      const situation = await situationAdministrativeRepository.create({
        personnelId,
        typeSituationId,
        dateDebut,
        referenceDecision: data.referenceDecision,
        documentFilename: data.justificatif?.filename || null,
        documentPath: data.justificatif?.path || null,
        observations: data.observations,
        motif: data.motif,
        createdBy,
      }, client);

      const destinataireUserId = await personnelRepository.findLinkedUserId(personnelId);
      if (destinataireUserId) {
        await notificationRepository.create({
          senderId: createdBy,
          recipientId: destinataireUserId,
          title: 'Changement de situation administrative',
          message: `Votre situation administrative a été mise à jour : ${type.libelle}.`,
          type: 'info',
          lien: '/carriere',
        }, client);
      }

      return situation;
    }).then(async (situation) => {
      await activityLogRepository.create(createdBy, 'situation_administrative', `Nouvelle situation administrative enregistrée pour la fiche #${personnelId}`);
      return situation;
    });
  } catch (err) {
    // Filet de sécurité : l'index unique (migration 010) a refusé une 2e situation ouverte.
    if (err.code === '23505') throw new SituationError('Une situation administrative est déjà ouverte pour ce personnel.', 409);
    throw err;
  }
}

async function getForPersonnel(personnelIdRaw) {
  const personnelId = parseId(personnelIdRaw, 'Identifiant du personnel');
  const historique = await situationAdministrativeRepository.findByPersonnel(personnelId);
  const actuelle = historique.find((s) => !s.date_fin) || null;
  return { actuelle, historique };
}

async function updateSituation(idRaw, data, userId) {
  const id = parseId(idRaw, 'Identifiant de la situation');
  const situation = await situationAdministrativeRepository.findById(id);
  if (!situation) throw new SituationError('Situation introuvable', 404);

  const updated = await situationAdministrativeRepository.update(id, {
    referenceDecision: data.referenceDecision,
    observations: data.observations,
    motif: data.motif,
  });

  await activityLogRepository.create(
    userId, 'situation_administrative_modifiee',
    `Situation administrative #${id} modifiée pour la fiche #${situation.personnel_id}`
  );
  return updated;
}

// Ne peut être supprimée que la situation actuelle (non clôturée) : supprimer une
// situation historique laisserait un trou dans la timeline. En supprimant la
// situation ouverte, on rouvre celle qu'elle avait fermée (date_fin -> NULL),
// pour que la chaîne "une seule situation ouverte à la fois" reste cohérente.
// Suppression puis réouverture (dans cet ordre, à cause de l'index unique), en
// une transaction verrouillant la fiche.
async function deleteSituation(idRaw, userId) {
  const id = parseId(idRaw, 'Identifiant de la situation');
  const personnelId = await pool.withTransaction(async (client) => {
    const situation = await situationAdministrativeRepository.findById(id, client);
    if (!situation) throw new SituationError('Situation introuvable', 404);
    await situationAdministrativeRepository.lockPersonnel(situation.personnel_id, client);
    // Relecture sous verrou : l'état a pu changer pendant l'attente.
    const locked = await situationAdministrativeRepository.findById(id, client);
    if (!locked) throw new SituationError('Situation introuvable', 404);
    if (locked.date_fin !== null) {
      throw new SituationError("Seule la situation actuelle (non clôturée) peut être supprimée. Supprimez d'abord les situations plus récentes.", 409);
    }

    const previous = await situationAdministrativeRepository.findClosedByFollowing(
      locked.personnel_id, locked.date_debut_txt, locked.id, client
    );
    await situationAdministrativeRepository.remove(id, client);
    if (previous) await situationAdministrativeRepository.reopenSituation(previous.id, client);
    return locked.personnel_id;
  });

  await activityLogRepository.create(
    userId, 'situation_administrative_supprimee',
    `Situation administrative #${id} supprimée pour la fiche #${personnelId}`
  );
}

async function getDocumentPourTelechargement(situationIdRaw, requestingUser) {
  const situationId = parseId(situationIdRaw, 'Identifiant de la situation');
  const situation = await situationAdministrativeRepository.findById(situationId);
  if (!situation) throw new SituationError('Situation introuvable', 404);
  if (!situation.document_path) throw new Error('Aucun document pour cette situation');

  const isAdmin = requestingUser.role === 'ADMIN_RH' || requestingUser.role === 'SUPERADMIN';
  const isOwner = requestingUser.personnel_id === situation.personnel_id;
  if (!isAdmin && !isOwner) throw new Error('Accès refusé à ce document');

  return situation;
}

module.exports = { SituationError, listTypes, addSituation, getForPersonnel, updateSituation, deleteSituation, getDocumentPourTelechargement };