const otpRepository = require('../repositories/otpRepository');
const { sendOtpEmail } = require('../config/mailer');

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres
}

async function requestOtp(email) {
  const code = generateCode();
  await otpRepository.create(email, code);
  await sendOtpEmail(email, code);
}

async function verifyOtp(email, code) {
  const otp = await otpRepository.findValid(email, code);
  if (!otp) throw new Error('Code invalide ou expiré');
  await otpRepository.markUsed(otp.id);
  return true;
}

module.exports = { requestOtp, verifyOtp };