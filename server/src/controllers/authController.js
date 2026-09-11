const authService = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Erreur login:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function me(req, res) {
  return res.status(200).json({ user: req.user });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
  }
  try {
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return res.status(200).json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Erreur changePassword:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });

  await authService.requestPasswordReset(email);
  return res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token et nouveau mot de passe requis' });

  try {
    await authService.resetPassword(token, newPassword);
    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Erreur resetPassword:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { login, me, changePassword, forgotPassword, resetPassword };