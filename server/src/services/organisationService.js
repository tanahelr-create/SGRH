// Gestion des directions et services par la RH (ajout/suppression). Créer/supprimer
// est volontairement tout ce qui est proposé : pas de renommage, pour rester strictement
// dans le périmètre demandé.
const organisationRepository = require('../repositories/organisationRepository');
const activityLogRepository = require('../repositories/activityLogRepository');

class OrganisationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function nettoyerNom(valeur, label) {
  const nom = String(valeur || '').trim();
  if (!nom) throw new OrganisationError(`${label} est requis.`);
  if (nom.length > 150) throw new OrganisationError(`${label} ne doit pas dépasser 150 caractères.`);
  return nom;
}

async function creerDirection(nom, creePar) {
  const nomPropre = nettoyerNom(nom, 'Le nom de la direction');
  let direction;
  try {
    direction = await organisationRepository.createDirection(nomPropre);
  } catch (err) {
    if (err.code === '23505') throw new OrganisationError('Une direction porte déjà ce nom.', 409);
    throw err;
  }
  await activityLogRepository.create(creePar, 'organisation_direction_creee', `Direction créée : ${nomPropre}`);
  return direction;
}

// Une direction ne peut être supprimée que si elle n'a plus de service et qu'aucune
// fiche personnel ne la référence encore (personnel.direction est du texte libre, sans
// clé étrangère : la supprimer sous eux laisserait leur fiche pointer vers rien).
async function supprimerDirection(idRaw, supprimePar) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) throw new OrganisationError('Identifiant de direction invalide.');

  const direction = await organisationRepository.findDirectionById(id);
  if (!direction) throw new OrganisationError('Direction introuvable.', 404);

  const nbServices = await organisationRepository.countServicesByDirection(id);
  if (nbServices > 0) {
    throw new OrganisationError(
      `Impossible de supprimer « ${direction.nom} » : ${nbServices} service(s) en dépendent encore. Supprimez-les d'abord.`,
      409
    );
  }
  const nbPersonnel = await organisationRepository.countPersonnelByDirectionNom(direction.nom);
  if (nbPersonnel > 0) {
    throw new OrganisationError(
      `Impossible de supprimer « ${direction.nom} » : ${nbPersonnel} personne(s) y sont rattachées. Modifiez leur fiche avant de supprimer la direction.`,
      409
    );
  }

  await organisationRepository.deleteDirection(id);
  await activityLogRepository.create(supprimePar, 'organisation_direction_supprimee', `Direction supprimée : ${direction.nom}`);
}

async function creerService(nom, directionIdRaw, creePar) {
  const directionId = Number(directionIdRaw);
  if (!Number.isInteger(directionId) || directionId < 1) throw new OrganisationError('Direction invalide.');
  const direction = await organisationRepository.findDirectionById(directionId);
  if (!direction) throw new OrganisationError('Direction introuvable.', 404);

  const nomPropre = nettoyerNom(nom, 'Le nom du service');
  let service;
  try {
    service = await organisationRepository.createService(nomPropre, directionId);
  } catch (err) {
    if (err.code === '23505') throw new OrganisationError('Un service porte déjà ce nom dans cette direction.', 409);
    throw err;
  }
  await activityLogRepository.create(creePar, 'organisation_service_cree', `Service créé : ${nomPropre} (${direction.nom})`);
  return service;
}

// Un service ne peut être supprimé que si aucune fiche personnel ne le référence encore
// (même raison que pour une direction : personnel.service est du texte libre).
async function supprimerService(idRaw, supprimePar) {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) throw new OrganisationError('Identifiant de service invalide.');

  const service = await organisationRepository.findServiceById(id);
  if (!service) throw new OrganisationError('Service introuvable.', 404);

  const nbPersonnel = await organisationRepository.countPersonnelByServiceNom(service.nom);
  if (nbPersonnel > 0) {
    throw new OrganisationError(
      `Impossible de supprimer « ${service.nom} » : ${nbPersonnel} personne(s) y sont rattachées. Modifiez leur fiche avant de supprimer le service.`,
      409
    );
  }

  await organisationRepository.deleteService(id);
  await activityLogRepository.create(supprimePar, 'organisation_service_supprime', `Service supprimé : ${service.nom}`);
}

module.exports = { OrganisationError, creerDirection, supprimerDirection, creerService, supprimerService };
