const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const situationAdministrativeService = require('../services/situationAdministrativeService');
const personnelRepository = require('../repositories/personnelRepository');
const { sendUploadedFile } = require('../utils/secureFileServing');
const { isAllowedFile } = require('../utils/fileSignature');

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

async function saveFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !isAllowedFile(file.buffer, file.originalname, ['pdf', 'jpg', 'png'])) {
    throw new Error('Formats acceptés : PDF, JPG, PNG');
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const folder = path.join(__dirname, '../../uploads/situations-administratives');
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, filename), file.buffer, { flag: 'wx' });
  return { filename: file.originalname, path: `/uploads/situations-administratives/${filename}` };
}

async function types(req, res) {
  const list = await situationAdministrativeService.listTypes();
  return res.status(200).json({ types: list });
}

async function getForPersonnel(req, res) {
  const result = await situationAdministrativeService.getForPersonnel(req.params.personnelId);
  return res.status(200).json(result);
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
  try {
    const justificatif = req.file ? await saveFile(req.file) : null;
    const situation = await situationAdministrativeService.addSituation(req.params.personnelId, {
      typeSituationId, dateDebut, referenceDecision, observations, motif, justificatif,
    }, req.user.id);
    return res.status(201).json({ message: 'Situation enregistrée', situation });
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
    return res.status(err.message === 'Situation introuvable' ? 404 : 400).json({ message: err.message });
  }
}

async function deleteSituation(req, res) {
  try {
    await situationAdministrativeService.deleteSituation(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Situation supprimée' });
  } catch (err) {
    return res.status(err.message === 'Situation introuvable' ? 404 : 400).json({ message: err.message });
  }
}

async function telechargerDocument(req, res) {
  try {
    const situation = await situationAdministrativeService.getDocumentPourTelechargement(req.params.id, req.user);
    return sendUploadedFile(res, situation.document_path, situation.document_filename);
  } catch (err) {
    const status = err.message === 'Accès refusé à ce document' ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
}

module.exports = { types, getForPersonnel, getMine, addSituation, updateSituation, deleteSituation, telechargerDocument };