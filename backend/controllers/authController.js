const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

exports.register = async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: 'Nom ou email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'user',
      avatar: req.file ? req.file.path : null
    });

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Champs manquants' });

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Identifiants invalides' });

    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET manquant' });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Accès interdit' });

  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession)
      return res.status(400).json({ error: 'Tous les champs sont requis' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Nom déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'admin',
      avatar: req.file ? req.file.path : null
    });

    await admin.save();

    res.status(201).json({ message: 'Admin créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role))
    return res.status(403).json({ error: 'Accès interdit' });

  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession)
      return res.status(400).json({ error: 'Tous les champs sont requis' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Nom déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'user',
      avatar: req.file ? req.file.path : null
    });

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Accès refusé' });

  try {
    const users = await User.find({}, '-password -resetPasswordCode -resetPasswordExpires');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetSuperadmin = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await User.findOneAndUpdate({ username: 'superadmin' }, { password: hashedPassword });
    res.json({ message: 'Mot de passe superadmin réinitialisé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Email non trouvé' });

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation mot de passe - Sousse GreenMap',
      html: `<div style="font-family: Arial; max-width: 600px;">
               <h2 style="color: #2e7d32;">Réinitialisation mot de passe</h2>
               <p>Code : <strong>${resetCode}</strong></p>
               <p>Valable 15 minutes.</p>
             </div>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Code de réinitialisation envoyé par email' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur envoi email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Email non trouvé' });

    if (user.resetPasswordCode !== code || user.resetPasswordExpires < Date.now())
      return res.status(400).json({ error: 'Code invalide ou expiré' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Déconnecté' });
};
