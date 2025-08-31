// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enregistrement utilisateur
exports.register = async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    
    // Validation
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ 
        success: false,
        error: 'Tous les champs sont requis' 
      });
    }

    // Vérification doublon
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Nom d\'utilisateur ou email déjà utilisé' 
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création utilisateur
    const user = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'user',
      avatar: req.file?.path
    });

    await user.save();

    // Réponse sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userResponse
    });

  } catch (err) {
    console.error('Register error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de l\'inscription' 
    });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Nom d\'utilisateur et mot de passe requis' 
      });
    }

    // Recherche par username ou email
    const user = await User.findOne({ $or: [{ username }, { email: username }] })
                          .select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false,
        error: 'Identifiants incorrects' 
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Réponse sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la connexion' 
    });
  }
};

// Récupération des infos de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    res.json({ 
      success: true,
      user 
    });

  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};

// Réinitialisation mot de passe
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Sécurité : ne pas révéler si l'email existe
      return res.json({ 
        success: true,
        message: 'Si un compte existe avec cet email, un lien a été envoyé' 
      });
    }

    // Génération du token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    await user.save();

    // Envoi de l'email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Sousse GreenMap" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial; max-width: 600px;">
          <h2 style="color: #2e7d32;">Réinitialisation de mot de passe</h2>
          <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Réinitialiser le mot de passe
          </a>
          <p>Ce lien expirera dans 15 minutes.</p>
        </div>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      message: 'Email de réinitialisation envoyé' 
    });

  } catch (err) {
    console.error('RequestPasswordReset error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email' 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Token et nouveau mot de passe requis' 
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        error: 'Token invalide ou expiré' 
      });
    }

    // Mise à jour du mot de passe
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ 
      success: true,
      message: 'Mot de passe réinitialisé avec succès' 
    });

  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la réinitialisation' 
    });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  res.json({ 
    success: true,
    message: 'Déconnexion réussie' 
  });
};