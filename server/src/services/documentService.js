const documentRepository = require('../repositories/documentRepository');
const demandeDocumentRepository = require('../repositories/demandeDocumentRepository');
const personnelRepository = require('../repositories/personnelRepository');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

const TYPES_VALIDES = ['certificat_administratif', 'lettre_confirmation'];

async function generateDocument(personnelId, typeDocument, donnees, generePar) {
  if (!TYPES_VALIDES.includes(typeDocument)) {
    throw new Error('Type de document invalide');
  }
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const numero = await documentRepository.genererNumero(typeDocument);
  const donneesCompletes = { ...donnees, numero };

  const document = await documentRepository.create({ personnelId, typeDocument, donnees: donneesCompletes, generePar });

  await activityLogRepository.create(
    generePar, 'document_genere',
    `Document "${typeDocument}" (${numero}) généré pour ${personnel.prenom} ${personnel.nom}`
  );

  return document;
}

async function getDocument(id, requestingUser) {
  const document = await documentRepository.findById(id);
  if (!document) throw new Error('Document introuvable');

  const isAdmin = requestingUser.role === 'ADMIN_RH' || requestingUser.role === 'SUPERADMIN';
  const isOwner = requestingUser.personnel_id === document.personnel_id;
  if (!isAdmin && !isOwner) throw new Error('Accès refusé à ce document');

  return document;
}

async function getHistoriquePersonnel(personnelId) {
  return documentRepository.findByPersonnel(personnelId);
}

async function demanderDocument(userId, typeDocument, motif) {
  if (!TYPES_VALIDES.includes(typeDocument)) {
    throw new Error('Type de document invalide');
  }
  const user = await userRepository.findById(userId);
  if (!user || !user.personnel_id) throw new Error('Aucune fiche personnel associée à ce compte');

  const demande = await demandeDocumentRepository.create({ personnelId: user.personnel_id, typeDocument, motif });

  const admins = await userRepository.listActive({ role: 'ADMIN_RH' });
  for (const admin of admins) {
    await notificationRepository.create({
      senderId: userId,
      recipientId: admin.id,
      title: 'Nouvelle demande de document',
      message: `${user.prenom} ${user.nom} demande un document : ${typeDocument}.`,
      type: 'info',
    });
  }

  await activityLogRepository.create(userId, 'document_demande', `Demande de document "${typeDocument}" soumise`);
  return demande;
}

async function getMesDemandesDocuments(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.personnel_id) throw new Error('Aucune fiche personnel associée à ce compte');
  return demandeDocumentRepository.findByPersonnel(user.personnel_id);
}

async function getDemandesEnAttente() {
  return demandeDocumentRepository.findPending();
}

async function traiterDemande(demandeId, donnees, traitePar) {
  const demande = await demandeDocumentRepository.findById(demandeId);
  if (!demande || demande.statut !== 'en_attente') {
    throw new Error('Demande introuvable ou déjà traitée');
  }

  const document = await generateDocument(demande.personnel_id, demande.type_document, donnees, traitePar);
  await demandeDocumentRepository.marquerTraitee(demandeId, document.id, traitePar);

  const destinataireUserId = await personnelRepository.findLinkedUserId(demande.personnel_id);
  if (destinataireUserId) {
    await notificationRepository.create({
      senderId: traitePar,
      recipientId: destinataireUserId,
      title: 'Document prêt',
      message: `Votre demande de "${demande.type_document}" a été traitée, le document est disponible.`,
      type: 'info',
    });
  }

  await activityLogRepository.create(traitePar, 'document_demande_traitee', `Demande de document #${demandeId} traitée`);
  return document;
}

async function refuserDemande(demandeId, traitePar) {
  const demande = await demandeDocumentRepository.findById(demandeId);
  if (!demande || demande.statut !== 'en_attente') {
    throw new Error('Demande introuvable ou déjà traitée');
  }
  const result = await demandeDocumentRepository.marquerRefusee(demandeId, traitePar);

  const destinataireUserId = await personnelRepository.findLinkedUserId(demande.personnel_id);
  if (destinataireUserId) {
    await notificationRepository.create({
      senderId: traitePar,
      recipientId: destinataireUserId,
      title: 'Demande de document refusée',
      message: `Votre demande de "${demande.type_document}" a été refusée.`,
      type: 'info',
    });
  }

  await activityLogRepository.create(traitePar, 'document_demande_refusee', `Demande de document #${demandeId} refusée`);
  return result;
}

module.exports = {
  generateDocument, getDocument, getHistoriquePersonnel, TYPES_VALIDES,
  demanderDocument, getMesDemandesDocuments, getDemandesEnAttente, traiterDemande, refuserDemande,
};