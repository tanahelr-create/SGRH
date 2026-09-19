const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const carriereService = require('../services/carriereService');
const personnelRepository = require('../repositories/personnelRepository');
const { sendUploadedFile } = require('../utils/secureFileServing');
const { isAllowedFile } = require('../utils/fileSignature');

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];

// Le formulaire d'événement carrière part en multipart/form-data (justificatif inclus),
// donc resolveFromGrille arrive en JSON stringifié dans un champ texte, pas en objet.
function parseResolveFromGrille(raw) {
  if (!raw || typeof raw === 'object') return raw || undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function saveUploadedFile(file, subfolder) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !isAllowedFile(file.buffer, file.originalname, ['pdf', 'jpg', 'png'])) {
    throw new Error('Formats acceptés : PDF, JPG, PNG');
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const folder = path.join(__dirname, `../../uploads/${subfolder}`);
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, filename), file.buffer, { flag: 'wx' });
  return { filename: file.originalname, path: `/uploads/${subfolder}/${filename}` };
}

async function getForPersonnel(req, res) {
  try {
    const result = await carriereService.getCarriere(req.params.personnelId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

async function getMine(req, res) {
  const personnel = await personnelRepository.findByUserId(req.user.id);
  if (!personnel) return res.status(404).json({ message: 'Aucune fiche personnel associée' });

  const result = await carriereService.getCarriere(personnel.id);
  return res.status(200).json(result);
}

async function addEvenement(req, res) {
  const {
    typeEvenement, description, dateEvenement, dateEffet, corps, grade, classe, echelon,
    indice, fonction, affectation, motif, referenceDecision, autoriteDecision, observations, resolveFromGrille,
  } = req.body;

  if (!typeEvenement || !dateEvenement) {
    return res.status(400).json({ message: 'typeEvenement et dateEvenement sont requis' });
  }

  try {
    const justificatif = req.file ? await saveUploadedFile(req.file, 'justificatifs-carriere') : null;
    const evenement = await carriereService.addEvenement(req.params.personnelId, {
      typeEvenement, description, dateEvenement, dateEffet, corps, grade, classe, echelon,
      indice, fonction, affectation, motif, referenceDecision, autoriteDecision, observations, justificatif,
      resolveFromGrille: parseResolveFromGrille(resolveFromGrille),
    }, req.user.id);
    return res.status(201).json({ message: 'Événement ajouté', evenement });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function updateEvenement(req, res) {
  const {
    typeEvenement, description, dateEvenement, dateEffet, corps, grade, classe, echelon,
    indice, fonction, affectation, motif, referenceDecision, autoriteDecision, observations, resolveFromGrille,
  } = req.body;

  try {
    const justificatif = req.file ? await saveUploadedFile(req.file, 'justificatifs-carriere') : null;
    const evenement = await carriereService.updateEvenement(req.params.id, {
      typeEvenement, description, dateEvenement, dateEffet, corps, grade, classe, echelon,
      indice, fonction, affectation, motif, referenceDecision, autoriteDecision, observations, justificatif,
      resolveFromGrille: parseResolveFromGrille(resolveFromGrille),
    }, req.user.id);
    return res.status(200).json({ message: 'Événement modifié', evenement });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function deleteEvenement(req, res) {
  try {
    await carriereService.deleteEvenement(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Événement supprimé' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function addDiplome(req, res) {
  const { intitule, etablissement, anneeObtention } = req.body;
  if (!intitule) return res.status(400).json({ message: 'Intitulé requis' });

  try {
    const document = req.file ? await saveUploadedFile(req.file, 'diplomes') : null;
    const diplome = await carriereService.addDiplome(req.params.personnelId, { intitule, etablissement, anneeObtention, document }, req.user.id);
    return res.status(201).json({ message: 'Diplôme ajouté', diplome });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function deleteDiplome(req, res) {
  try {
    await carriereService.deleteDiplome(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Diplôme supprimé' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function echeances(req, res) {
  const list = await carriereService.getEcheancesProches();
  return res.status(200).json({ echeances: list });
}

async function telechargerJustificatifEvenement(req, res) {
  try {
    const evenement = await carriereService.getJustificatifEvenement(req.params.id, req.user);
    return sendUploadedFile(res, evenement.justificatif_path, evenement.justificatif_filename);
  } catch (err) {
    const status = err.message === 'Accès refusé à ce document' ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
}

async function telechargerDocumentDiplome(req, res) {
  try {
    const diplome = await carriereService.getDocumentDiplome(req.params.id, req.user);
    return sendUploadedFile(res, diplome.document_path, diplome.document_filename);
  } catch (err) {
    const status = err.message === 'Accès refusé à ce document' ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
}

module.exports = {
  getForPersonnel, getMine, addEvenement, updateEvenement, deleteEvenement, addDiplome, deleteDiplome, echeances,
  telechargerJustificatifEvenement, telechargerDocumentDiplome,
};