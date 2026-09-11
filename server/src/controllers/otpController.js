const otpService = require('../services/otpService');

async function request(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });

  try {
    await otpService.requestOtp(email);
    return res.status(200).json({ message: 'Code envoyé' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function verify(req, res) {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email et code requis' });

  try {
    await otpService.verifyOtp(email, code);
    return res.status(200).json({ message: 'Code vérifié', verified: true });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { request, verify };