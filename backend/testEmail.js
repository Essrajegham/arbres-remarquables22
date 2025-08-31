require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_USER,
  subject: 'Test email nodemailer',
  text: 'Ceci est un test pour vérifier la configuration du mailer.'
};

transporter.sendMail(mailOptions)
  .then(info => {
    console.log('Email envoyé:', info.response);
  })
  .catch(err => {
    console.error('Erreur envoi email:', err);
  });
