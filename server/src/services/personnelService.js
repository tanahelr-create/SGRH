const personnelRepository = require('../repositories/personnelRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const organisationRepository = require('../repositories/organisationRepository');
const { sendRegistrationLinkEmail } = require('../config/mailer');
const corbeilleRepository = require('../repositories/corbeilleRepository');

const ROLES_VALIDES = ['PE', 'PAT'];

async function createPersonnel(data, createdBy) {
  const existing = await personnelRepository.findByMatricule(data.matricule);
  if (existing) throw new Error('Ce matricule existe déjà');

  const personnel = await personnelRepository.create(data);
  await organisationRepository.syncResponsable(personnel.id, data.fonction, data.service, data.direction);
  await activityLogRepository.create(createdBy, 'personnel_cree', `Fiche personnel créée : ${data.matricule} — ${data.nom} ${data.prenom}`);
  return personnel;
}

async function listPersonnel() {
  return personnelRepository.listAll();
}

async function listWithoutAccount() {
  return personnelRepository.listWithoutAccount();
}

async function sendRegistrationLink(personnelId, sentBy) {
  const personnel = await personnelRepository.findByIdRaw(personnelId);
  if (!personnel) throw new Error('Fiche personnel introuvable');

  const alreadyLinked = await personnelRepository.isLinkedToUser(personnel.id);
  if (alreadyLinked) throw new Error('Cette personne a déjà un compte');

  const registerLink = `${process.env.FRONTEND_URL}/register?email=${encodeURIComponent(personnel.email)}`;
  await sendRegistrationLinkEmail(personnel.email, registerLink);

  await activityLogRepository.create(sentBy, 'lien_inscription_envoye', `Lien d'inscription envoyé à ${personnel.email} (matricule ${personnel.matricule})`);
}

function validateRow(row) {
  const matricule = String(row.matricule || '').trim();
  const role = String(row.role || '').trim().toUpperCase();
  const email = String(row.email || '').trim();

  if (!/^[0-9]{6}$/.test(matricule)) return 'Matricule invalide (doit contenir exactement 6 chiffres)';
  if (!ROLES_VALIDES.includes(role)) return 'Rôle invalide (doit être PE ou PAT)';
  if (!email || !email.includes('@')) return 'Email invalide ou manquant';
  if (!row.nom || !row.prenom) return 'Nom et prénom requis';
  return null;
}

async function importFromRows(rows, importedBy) {
  const results = { inserted: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNumber = i + 2; // +2 : ligne 1 = en-têtes, tableau 0-indexé

    const validationError = validateRow(row);
    if (validationError) {
      results.errors.push({ line: lineNumber, reason: validationError });
      continue;
    }

    const matricule = String(row.matricule).trim();
    const email = String(row.email).trim();

    try {
      const existingMatricule = await personnelRepository.findByMatricule(matricule);
      if (existingMatricule) {
        results.errors.push({ line: lineNumber, reason: `Matricule ${matricule} déjà existant, ligne ignorée` });
        continue;
      }
      const existingEmail = await personnelRepository.findByEmailRaw(email);
      if (existingEmail) {
        results.errors.push({ line: lineNumber, reason: `Email ${email} déjà existant, ligne ignorée` });
        continue;
      }

      const fonction = row.fonction ? String(row.fonction).trim() : null;
      const service = row.service ? String(row.service).trim() : null;
      const direction = row.direction ? String(row.direction).trim() : null;

      const personnel = await personnelRepository.create({
        matricule,
        nom: String(row.nom).trim(),
        prenom: String(row.prenom).trim(),
        email,
        role: String(row.role).trim().toUpperCase(),
        fonction,
        corps: row.corps ? String(row.corps).trim() : null,
        grade: row.grade ? String(row.grade).trim() : null,
        service,
        direction,
        telephone: row.telephone ? String(row.telephone).trim() : null,
        typeContrat: row.type_contrat ? String(row.type_contrat).trim() : null,
      });
      await organisationRepository.syncResponsable(personnel.id, fonction, service, direction);
      results.inserted++;
    } catch (err) {
      results.errors.push({ line: lineNumber, reason: err.message });
    }
  }

  await activityLogRepository.create(
    importedBy, 'personnel_importe',
    `Import Excel : ${results.inserted} fiche(s) créée(s), ${results.errors.length} erreur(s)`
  );

  return results;
}

async function updateMesInfos(userId, nouvellesInfos) {
  const userRepository = require('./../repositories/userRepository');
  const user = await userRepository.findById(userId);
  if (!user || !user.personnel_id) throw new Error('Aucune fiche personnel associée à ce compte');

  const ancienneFiche = await personnelRepository.findByIdRaw(user.personnel_id);
  if (!ancienneFiche) throw new Error('Fiche personnel introuvable');

  // Archive l'ancienne version complète dans la corbeille avant toute modification
  await corbeilleRepository.add('personnel_modifie', ancienneFiche, userId);

  const misAJour = await personnelRepository.updateInfosPersonnelles(user.personnel_id, nouvellesInfos);

  await activityLogRepository.create(userId, 'personnel_infos_modifiees', `Informations personnelles mises à jour (téléphone/adresse/situation familiale)`);

  return misAJour;
}

module.exports = { createPersonnel, listPersonnel, listWithoutAccount, sendRegistrationLink, importFromRows, updateMesInfos };