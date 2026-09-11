require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Échec de connexion au service mail :', error.message);
  } else {
    console.log('Service mail prêt à envoyer des emails');
  }
});

async function sendInvitationEmail(toEmail, invitationLink) {
  await transporter.sendMail({
    from: `"RH Université de Mahajanga" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Invitation à créer votre compte - Espace RH',
    html: `
      <p>Bonjour,</p>
      <p>L'administration des ressources humaines de l'Université de Mahajanga vous invite à créer votre compte sur sa plateforme de gestion RH.</p>
      <p><a href="${invitationLink}">Cliquez ici pour créer votre compte</a></p>
      <p>Ce lien expire dans 7 jours.</p>
    `,
  });
}

async function sendAccountConfirmedEmail(toEmail) {
  await transporter.sendMail({
    from: `"RH Université de Mahajanga" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Votre compte a été confirmé',
    html: `
      <p>Bonjour,</p>
      <p>Votre compte sur la plateforme de gestion RH de l'Université de Mahajanga a été confirmé par l'administration.</p>
      <p>Vous pouvez maintenant vous connecter : <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
    `,
  });
}

async function sendOtpEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"RH Université de Mahajanga" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Votre code de vérification',
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code de vérification pour créer votre compte :</p>
      <h2 style="letter-spacing: 4px;">${code}</h2>
      <p>Ce code expire dans 10 minutes.</p>
    `,
  });
}

async function sendRegistrationLinkEmail(toEmail, registerLink) {
  await transporter.sendMail({
    from: `"RH Université de Mahajanga" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Créez votre compte - Espace RH',
    html: `
      <p>Bonjour,</p>
      <p>Vous pouvez maintenant créer votre compte sur la plateforme RH de l'Université de Mahajanga.</p>
      <p><a href="${registerLink}">Cliquez ici pour créer votre compte</a></p>
      <p>Vous aurez besoin de votre matricule pour finaliser l'inscription.</p>
    `,
  });
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"RH Université de Mahajanga" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <p>Bonjour,</p>
      <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>
      <p><a href="${resetLink}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
      <p>Ce lien expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}

module.exports = { sendInvitationEmail, sendAccountConfirmedEmail, sendOtpEmail, sendRegistrationLinkEmail, sendPasswordResetEmail };