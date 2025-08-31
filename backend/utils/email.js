const nodemailer = require('nodemailer');

// Vérifie que les variables d'env sont bien définies
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

async function sendResetCodeEmail(toEmail, code) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour,\n\nVoici votre code de réinitialisation : ${code}\n\nCordialement,\nSousse GreenMap`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info.response);
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’email :", error);
    throw new Error('Erreur lors de l’envoi de l’email');
  }
}

module.exports = { sendResetCodeEmail };


