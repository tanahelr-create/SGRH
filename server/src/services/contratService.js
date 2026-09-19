const contratRepository = require('../repositories/contratRepository');
const personnelRepository = require('../repositories/personnelRepository');
const notificationRepository = require('../repositories/notificationRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

async function getContratComplet(contratId) {
  const contrat = await contratRepository.findById(contratId);
  const documents = await contratRepository.findDocumentsByContrat(contratId);
  return { ...contrat, documents };
}

async function getHistorique(personnelId) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const contrats = await contratRepository.findByPersonnel(personnelId);
  const contratsAvecDocuments = await Promise.all(
    contrats.map(async (c) => ({ ...c, documents: await contratRepository.findDocumentsByContrat(c.id) }))
  );

  return { personnel, contrats: contratsAvecDocuments };
}

// Premier contrat d'un personnel (ou un contrat "orphelin" ajouté rétroactivement
// pour compléter l'historique). Ne calcule rien : les dates viennent du RH.
async function importerContrat(personnelId, data, fichier, importePar) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const dejaActif = await contratRepository.findActifByPersonnel(personnelId);
  if (dejaActif) {
    throw new Error('Ce personnel a déjà un contrat actif (#' + dejaActif.id + '). Clôturez-le ou passez par le renouvellement.');
  }

  const contrat = await contratRepository.createContrat({
    personnelId,
    typeContrat: data.typeContrat,
    dateDebut: data.dateDebut,
    dateFin: data.dateFin,
    numeroRenouvellement: 0,
    referenceDecision: data.referenceDecision,
    observations: data.observations,
    createdBy: importePar,
  });

  await contratRepository.addDocument({
    contratId: contrat.id,
    typeDocument: 'contrat_original',
    filename: fichier.filename,
    path: fichier.path,
    mimeType: fichier.mimeType,
    tailleOctets: fichier.tailleOctets,
    importePar,
  });

  await activityLogRepository.create(
    importePar, 'contrat_importe',
    `Contrat importé pour ${personnel.prenom} ${personnel.nom} (fiche #${personnelId})`
  );

  return getContratComplet(contrat.id);
}

// Ajoute une pièce supplémentaire (ex. avenant signé) à un contrat existant.
async function ajouterDocument(contratId, fichier, typeDocument, importePar) {
  const contrat = await contratRepository.findById(contratId);
  if (!contrat) throw new Error('Contrat introuvable');

  const document = await contratRepository.addDocument({
    contratId,
    typeDocument,
    filename: fichier.filename,
    path: fichier.path,
    mimeType: fichier.mimeType,
    tailleOctets: fichier.tailleOctets,
    importePar,
  });

  await activityLogRepository.create(importePar, 'contrat_document_ajoute', `Document ajouté au contrat #${contratId}`);
  return document;
}

// Phase 11 : marque juste une décision sur le contrat en cours (intention RH).
// "renouvele_renegociation" = démarche en cours, rien n'est encore créé.
// "non_renouvele" = décision finale, motif obligatoire, notifie le personnel.
async function decider(contratId, decision, { motif, referenceDecision }, userId) {
  const contrat = await contratRepository.findById(contratId);
  if (!contrat) throw new Error('Contrat introuvable');

  if (decision === 'non_renouvele' && (!motif || !motif.trim())) {
    throw new Error('Le motif est obligatoire pour un non-renouvellement');
  }

  const updated = await contratRepository.updateDecision(contratId, {
    decision,
    motifNonRenouvellement: decision === 'non_renouvele' ? motif.trim() : null,
    referenceDecision,
    updatedBy: userId,
  });

  await activityLogRepository.create(userId, 'contrat_decision', `Décision "${decision}" enregistrée sur le contrat #${contratId}`);

  if (decision === 'non_renouvele') {
    const destinataireUserId = await personnelRepository.findLinkedUserId(updated.personnel_id);
    if (destinataireUserId) {
      await notificationRepository.create({
        senderId: userId,
        recipientId: destinataireUserId,
        title: 'Non-renouvellement de contrat',
        message: `Votre contrat ne sera pas renouvelé. Motif communiqué par les Ressources Humaines : ${motif.trim()}`,
        type: 'info',
        lien: '/mes-contrats',
      });
    }
  }

  return updated;
}

// Phase 12 : finalisation effective, après la démarche en présentiel. Crée le
// nouveau contrat (les dates/type sont saisis par le RH, jamais calculés ici),
// l'associe au précédent, marque l'ancien "renouvelé" sans le supprimer ni
// toucher à son PDF.
async function finaliserRenouvellement(personnelId, contratPrecedentId, data, fichier, userId) {
  const precedent = await contratRepository.findById(contratPrecedentId);
  if (!precedent || Number(precedent.personnel_id) !== Number(personnelId)) {
    throw new Error('Contrat précédent introuvable pour ce personnel');
  }

  // L'ancien contrat doit être clôturé AVANT la création du nouveau : les deux ne
  // peuvent jamais être "actif" en même temps (contrainte uniq_contrats_actif_par_personnel).
  await contratRepository.marquerRenouvele(precedent.id, userId);

  const nouveau = await contratRepository.createContrat({
    personnelId,
    typeContrat: data.typeContrat,
    dateDebut: data.dateDebut,
    dateFin: data.dateFin,
    numeroRenouvellement: (precedent.numero_renouvellement || 0) + 1,
    contratPrecedentId: precedent.id,
    referenceDecision: data.referenceDecision,
    observations: data.observations,
    createdBy: userId,
  });

  await contratRepository.addDocument({
    contratId: nouveau.id,
    typeDocument: 'contrat_original',
    filename: fichier.filename,
    path: fichier.path,
    mimeType: fichier.mimeType,
    tailleOctets: fichier.tailleOctets,
    importePar: userId,
  });

  await activityLogRepository.create(
    userId, 'contrat_renouvele',
    `Contrat #${precedent.id} renouvelé avec renégociation → nouveau contrat #${nouveau.id} (fiche #${personnelId})`
  );

  const destinataireUserId = await personnelRepository.findLinkedUserId(personnelId);
  if (destinataireUserId) {
    await notificationRepository.create({
      senderId: userId,
      recipientId: destinataireUserId,
      title: 'Contrat renouvelé',
      message: `Votre contrat a été renouvelé (${data.typeContrat}, à partir du ${data.dateDebut}).`,
      type: 'info',
      lien: '/mes-contrats',
    });
  }

  return getContratComplet(nouveau.id);
}

async function getDocumentPourTelechargement(documentId, requestingUser) {
  const document = await contratRepository.findDocumentById(documentId);
  if (!document) throw new Error('Document introuvable');

  const isAdmin = requestingUser.role === 'ADMIN_RH' || requestingUser.role === 'SUPERADMIN';
  const isOwner = requestingUser.personnel_id === document.personnel_id;
  if (!isAdmin && !isOwner) throw new Error('Accès refusé à ce document');

  return document;
}

module.exports = {
  getHistorique, importerContrat, ajouterDocument, decider,
  finaliserRenouvellement, getDocumentPourTelechargement,
};