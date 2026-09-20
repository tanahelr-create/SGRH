const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const situationAdministrativeService = require('../services/situationAdministrativeService');
const { SituationError } = situationAdministrativeService;
const personnelRepository = require('../repositories/personnelRepository');
const { sendUploadedFile } = require('../utils/secureFileServing');
const { isAllowedFile } = require('../utils/fileSignature');

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

async function saveFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !isAllowedFile(file.buffer, file.originalname, ['pdf', 'jpg', 'png'])) {
    throw new SituationError('Formats acceptés : PDF, JPG, PNG', 400);
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const folder = path.join(__dirname, '../../uploads/situations-administratives');
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, filename), file.buffer, { flag: 'wx' });
  return { filename: file.originalname, path: `/uploads/situations-administratives/${filename}` };
}

// Erreurs métier (SituationError) : statut et message tels quels. Toute autre
// erreur est inattendue : on la journalise et on ne renvoie pas son texte brut.
function sendError(res, err) {
  if (err instanceof SituationError) return res.status(err.status).json({ message: err.message });
  console.error('[situations-administratives]', err);
  return res.status(500).json({ message: 'Une erreur interne est survenue. Veuillez réessayer.' });
}

async function types(req, res) {
  const list = await situationAdministrativeService.listTypes();
  return res.status(200).json({ types: list });
}

async function getForPersonnel(req, res) {
  try {
    const result = await situationAdministrativeService.getForPersonnel(req.params.personnelId);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

async function getMine(req, res) {
  const personnel = await personnelRepository.findByUserId(req.user.id);
  if (!personnel) return res.status(404).json({ message: 'Aucune fiche personnel associée' });
  const result = await situationAdministrativeService.getForPersonnel(personnel.id);
  return res.status(200).json(result);
}

async function addSituation(req, res) {
  const { typeSituationId, dateDebut, referenceDecision, observations, motif } = req.body;
  if (!typeSituationId || !dateDebut) {
    return res.status(400).json({ message: 'typeSituationId et dateDebut sont requis' });
  }
  let justificatif = null;
  try {
    justificatif = req.file ? await saveFile(req.file) : null;
    const situation = await situationAdministrativeService.addSituation(req.params.personnelId, {
      typeSituationId, dateDebut, referenceDecision, observations, motif, justificatif,
    }, req.user.id);
    return res.status(201).json({ message: 'Situation enregistrée', situation });
  } catch (err) {
    // Création refusée : le justificatif déjà écrit sur disque serait orphelin.
    if (justificatif) await fs.unlink(path.join(__dirname, '../..', justificatif.path)).catch(() => {});
    return sendError(res, err);
  }
}

async function updateSituation(req, res) {
  const { referenceDecision, observations, motif } = req.body;
  try {
    const situation = await situationAdministrativeService.updateSituation(
      req.params.id, { referenceDecision, observations, motif }, req.user.id
    );
    return res.status(200).json({ message: 'Situation modifiée', situation });
  } catch (err) {
    return sendError(res, err);
  }
}

async function deleteSituation(req, res) {
  try {
    await situationAdministrativeService.deleteSituation(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Situation supprimée' });
  } catch (err) {
    return sendError(res, err);
  }
}

async function telechargerDocument(req, res) {
  try {
    const situation = await situationAdministrativeService.getDocumentPourTelechargement(req.params.id, req.user);
    return sendUploadedFile(res, situation.document_path, situation.document_filename);
  } catch (err) {
    if (err instanceof SituationError) return sendError(res, err);
    const status = err.message === 'Accès refusé à ce document' ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
}

module.exports = { types, getForPersonnel, getMine, addSituation, updateSituation, deleteSituation, telechargerDocument };