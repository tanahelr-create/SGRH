const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const contratService = require('../services/contratService');
const personnelRepository = require('../repositories/personnelRepository');
const { isAllowedFile } = require('../utils/fileSignature');

// Dossier PRIVÉ, jamais enregistré dans express.static — à la différence de
// uploads/, ces fichiers ne sont accessibles que via telechargerDocument ci-dessous,
// après vérification isAdmin/isOwner côté serveur (Phase 8).
const PRIVATE_UPLOADS_ROOT = path.join(__dirname, '../../private-uploads/contrats');

async function saveContratFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' || !isAllowedFile(file.buffer, file.originalname, ['pdf'])) {
    throw new Error('Seuls les fichiers PDF sont acceptés pour un contrat.');
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.mkdir(PRIVATE_UPLOADS_ROOT, { recursive: true });
  await fs.writeFile(path.join(PRIVATE_UPLOADS_ROOT, filename), file.buffer, { flag: 'wx' });
  return {
    filename: file.originalname, // nom d'origine, affiché à l'écran
    path: filename,              // nom UUID sur disque, relatif à PRIVATE_UPLOADS_ROOT
    mimeType: file.mimetype,
    tailleOctets: file.size,
  };
}

async function historiquePersonnel(req, res) {
  try {
    const historique = await contratService.getHistorique(req.params.personnelId);
    return res.status(200).json(historique);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
}

async function mesContrats(req, res) {
  const personnel = await personnelRepository.findByUserId(req.user.id);
  if (!personnel) return res.status(404).json({ message: 'Aucune fiche personnel associée' });

  const historique = await contratService.getHistorique(personnel.id);
  return res.status(200).json(historique);
}

async function importer(req, res) {
  const { typeContrat, dateDebut, dateFin, referenceDecision, observations } = req.body;
  if (!typeContrat || !dateDebut) {
    return res.status(400).json({ message: 'typeContrat et dateDebut sont requis' });
  }
  if (!req.file) return res.status(400).json({ message: 'Le PDF du contrat est requis' });

  try {
    const fichier = await saveContratFile(req.file);
    const contrat = await contratService.importerContrat(
      req.params.personnelId,
      { typeContrat, dateDebut, dateFin: dateFin || null, referenceDecision, observations },
      fichier,
      req.user.id
    );
    return res.status(201).json({ message: 'Contrat importé', contrat });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function ajouterDocument(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Un fichier PDF est requis' });

  try {
    const fichier = await saveContratFile(req.file);
    const document = await contratService.ajouterDocument(
      req.params.contratId, fichier, req.body.typeDocument || 'contrat_original', req.user.id
    );
    return res.status(201).json({ message: 'Document ajouté au contrat', document });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function marquerDecision(req, res) {
  const { decision, motif, referenceDecision } = req.body;
  if (!['renouvele_renegociation', 'non_renouvele'].includes(decision)) {
    return res.status(400).json({ message: 'Décision invalide' });
  }

  try {
    const contrat = await contratService.decider(req.params.contratId, decision, { motif, referenceDecision }, req.user.id);
    return res.status(200).json({ message: 'Décision enregistrée', contrat });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function finaliserRenouvellement(req, res) {
  const { typeContrat, dateDebut, dateFin, referenceDecision, observations } = req.body;
  if (!typeContrat || !dateDebut) {
    return res.status(400).json({ message: 'typeContrat et dateDebut sont requis pour le nouveau contrat' });
  }
  if (!req.file) return res.status(400).json({ message: 'Le PDF du nouveau contrat est requis' });

  try {
    const fichier = await saveContratFile(req.file);
    const contrat = await contratService.finaliserRenouvellement(
      req.params.personnelId,
      req.params.contratId,
      { typeContrat, dateDebut, dateFin: dateFin || null, referenceDecision, observations },
      fichier,
      req.user.id
    );
    return res.status(201).json({ message: 'Nouveau contrat enregistré', contrat });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function telechargerDocument(req, res) {
  try {
    const document = await contratService.getDocumentPourTelechargement(req.params.documentId, req.user);
    return res.download(path.join(PRIVATE_UPLOADS_ROOT, document.path), document.filename);
  } catch (err) {
    const status = err.message === 'Accès refusé à ce document' ? 403 : 404;
    return res.status(status).json({ message: err.message });
  }
}

module.exports = {
  historiquePersonnel, mesContrats, importer, ajouterDocument,
  marquerDecision, finaliserRenouvellement, telechargerDocument,
};