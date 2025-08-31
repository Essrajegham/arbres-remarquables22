const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { sendResetCodeEmail } = require('../utils/email');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,         // Ton email Gmail
    pass: process.env.EMAIL_PASSWORD      // Mot de passe d’application Gmail
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📝 Register
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password, fullName, profession } = req.body;

    if (!username || !email || !password || !fullName || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      profession,
      avatar: req.file ? req.file.path : null
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});


router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = resetCode;
    await user.save();

    // Envoi du mail avec Nodemailer
    await sendResetCodeEmail(email, resetCode);

    res.json({ message: 'Code envoyé par email' }); // En prod on ne renvoie pas le code dans la réponse

  } catch (err) {
  console.error("❌ Erreur backend route /request-password-reset :", err);
  res.status(500).json({ error: 'Erreur serveur interne' });
}

});


module.exports = router;
