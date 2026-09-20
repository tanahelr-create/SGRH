// Vérification publique de l'avis du chef de service par QR code.
//
// Le QR ne contient qu'une adresse avec un identifiant SIGNÉ (HMAC-SHA256, clé
// dédiée QR_SECRET, distincte de celle des sessions) : aucune donnée personnelle,
// identifiant non devinable. La page publique relit la base à chaque consultation :
// si l'avis n'est plus favorable, elle ne le confirme plus.
const crypto = require('crypto');
const QRCode = require('qrcode');
const congeRepository = require('../repositories/congeRepository');

class VerificationError extends Error {
  constructor(message, status = 404) {
    super(message);
    this.status = status;
  }
}

function cle() {
  if (!process.env.QR_SECRET) throw new Error('QR_SECRET manquant dans la configuration du serveur');
  return process.env.QR_SECRET;
}

function signer(payload) {
  return crypto.createHmac('sha256', cle()).update(payload).digest('base64url').slice(0, 22);
}

function creerToken(congeId) {
  const payload = Buffer.from(`avis:${congeId}`).toString('base64url');
  return `${payload}.${signer(payload)}`;
}

// Renvoie l'identifiant de la demande, ou null si le jeton est mal formé ou falsifié.
function lireToken(token) {
  const [payload, signature, ...reste] = String(token || '').split('.');
  if (!payload || !signature || reste.length > 0) return null;
  const attendu = Buffer.from(signer(payload));
  const recu = Buffer.from(signature);
  if (attendu.length !== recu.length || !crypto.timingSafeEqual(attendu, recu)) return null;
  const m = /^avis:(\d{1,9})$/.exec(Buffer.from(payload, 'base64url').toString());
  return m ? Number(m[1]) : null;
}

async function genererQrAvis(congeId) {
  const url = `${process.env.FRONTEND_URL || ''}/verification/${creerToken(congeId)}`;
  const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 220, errorCorrectionLevel: 'M' });
  return { url, dataUrl };
}

function ymd(d) {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// Données minimales exposées publiquement : pas de matricule, pas de coordonnées.
async function verifierAvis(token) {
  const id = lireToken(token);
  const demande = id ? await congeRepository.findByIdWithDetails(id) : null;
  if (!demande) throw new VerificationError('Lien de vérification invalide.');
  const favorable = demande.decision_intermediaire === 'approuvee';
  return {
    valide: favorable,
    message: favorable ? 'Avis favorable du chef de service confirmé.' : "Cet avis n'est pas (ou plus) un avis favorable.",
    numero: demande.id,
    typeConge: demande.type_conge,
    dateDebut: ymd(demande.date_debut),
    dateFin: ymd(demande.date_fin),
    agent: `${(demande.prenom || '').charAt(0)}. ${demande.nom || ''}`.trim(),
    validateur: favorable
      ? { nom: demande.validateur_nom, prenom: demande.validateur_prenom, fonction: demande.validateur_fonction }
      : null,
    dateAvis: favorable ? demande.decision_intermediaire_le : null,
  };
}

module.exports = { VerificationError, creerToken, lireToken, genererQrAvis, verifierAvis };
