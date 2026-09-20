const verificationService = require('../services/verificationService');

// Route publique (sans authentification) : vérification d'un QR d'avis.
async function verifierAvis(req, res) {
  try {
    const result = await verificationService.verifierAvis(req.params.token);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof verificationService.VerificationError) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('[verification]', err);
    return res.status(500).json({ message: 'Une erreur interne est survenue.' });
  }
}

module.exports = { verifierAvis };
