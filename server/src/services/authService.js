const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const { sendPasswordResetEmail } = require('../config/mailer');

const JWT_SECRET = process.env.JWT_SECRET;

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

async function login(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new AuthError('Identifiants invalides');

  if (user.status !== 'active') {
    throw new AuthError('Compte non activé ou désactivé');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw new AuthError('Identifiants invalides');

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findFullById(userId);
  if (!user) throw new AuthError('Utilisateur introuvable');

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw new AuthError('Mot de passe actuel incorrect');

  if (newPassword.length < 8) {
    throw new AuthError('Le nouveau mot de passe doit contenir au moins 8 caractères');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(userId, newHash);

  await activityLogRepository.create(userId, 'mot_de_passe_modifie', `Mot de passe modifié`);
}

async function requestPasswordReset(email) {
  const user = await userRepository.findByEmail(email);
  if (!user) return; // ne révèle jamais si l'email existe ou non, par sécurité

  const resetToken = await passwordResetRepository.create(user.id);
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken.token}`;
  await sendPasswordResetEmail(email, resetLink);
}

async function resetPassword(token, newPassword) {
  const resetToken = await passwordResetRepository.findValid(token);
  if (!resetToken) throw new AuthError('Lien invalide ou expiré');

  if (newPassword.length < 8) {
    throw new AuthError('Le mot de passe doit contenir au moins 8 caractères');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(resetToken.user_id, newHash);
  await passwordResetRepository.markUsed(resetToken.id);

  await activityLogRepository.create(resetToken.user_id, 'mot_de_passe_reinitialise', 'Mot de passe réinitialisé via lien de récupération');
}

module.exports = { login, changePassword, requestPasswordReset, resetPassword, AuthError };