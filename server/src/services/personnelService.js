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

async function updatePersonnel(id, data, updatedBy) {
  const existing = await personnelRepository.findByIdRaw(id);
  if (!existing) throw new Error('Fiche personnel introuvable');

  if (data.email && data.email !== existing.email) {
    const emailTaken = await personnelRepository.findByEmailRaw(data.email);
    if (emailTaken && emailTaken.id !== existing.id) {
      throw new Error('Cet email est déjà utilisé par une autre fiche');
    }
  }

  await corbeilleRepository.add('personnel_modifie', existing, updatedBy);

  const updated = await personnelRepository.updateFiche(id, {
    nom: data.nom ?? existing.nom,
    prenom: data.prenom ?? existing.prenom,
    email: data.email ?? existing.email,
    corps: data.corps ?? existing.corps,
    grade: data.grade ?? existing.grade,
    poste: data.poste ?? existing.poste,
    service: data.service ?? existing.service,
    direction: data.direction ?? existing.direction,
    telephone: data.telephone ?? existing.telephone,
    typeContrat: data.typeContrat ?? existing.type_contrat,
    dateRecrutement: data.dateRecrutement ?? existing.date_recrutement,
    dateEcheanceContrat: data.dateEcheanceContrat ?? existing.date_echeance_contrat,
    contratPermanent: data.contratPermanent ?? existing.contrat_permanent,
    classe: data.classe ?? existing.classe,
    echelon: data.echelon ?? existing.echelon,
    indice: data.indice ?? existing.indice,
    chapitreIb: data.chapitreIb ?? existing.chapitre_ib,
    categorieId: data.categorieId ?? existing.categorie_id,
  });

  await organisationRepository.syncResponsable(id, existing.fonction, updated.service, updated.direction);
  await activityLogRepository.create(updatedBy, 'personnel_modifie_par_rh', `Fiche personnel #${id} modifiée par le RH`);

  return updated;
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
    const lineNumber = i + 2;

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

  await corbeilleRepository.add('personnel_modifie', ancienneFiche, userId);

  const misAJour = await personnelRepository.updateInfosPersonnelles(user.personnel_id, nouvellesInfos);

  await activityLogRepository.create(userId, 'personnel_infos_modifiees', `Informations personnelles mises à jour (téléphone/adresse/situation familiale)`);

  return misAJour;
}

module.exports = { createPersonnel, updatePersonnel, listPersonnel, listWithoutAccount, sendRegistrationLink, importFromRows, updateMesInfos };