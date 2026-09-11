const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');
const notificationRepository = require('../repositories/notificationRepository');

async function register(req, res) {
  const { email, matricule, password } = req.body;
  if (!email || !matricule || !password) {
    return res.status(400).json({ message: 'Email, matricule et mot de passe requis' });
  }

  try {
    const user = await userService.registerWithMatricule(email, matricule, password);

    const admins = await userRepository.listActive({ role: 'ADMIN_RH' });
    for (const admin of admins) {
      await notificationRepository.create({
        senderId: null,
        recipientId: admin.id,
        title: 'Nouveau compte à valider',
        message: `Une inscription via matricule est en attente de validation.`,
        type: 'info',
      });
    }

    return res.status(201).json({ message: 'Compte créé, en attente de validation', user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { register };