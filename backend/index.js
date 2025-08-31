const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Tree = require('./models/Tree');

const avatarsPath = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
  console.log('Dossier uploads/avatars créé automatiquement');
}
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const treeRoutes = require('./routes/treeRoutes');
const avisRoutes = require('./routes/avisRoutes'); // Correction du nom du fichier
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/adminRoutes');


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // ex: 'smtp.gmail.com'
  port: process.env.EMAIL_PORT,  // ex: 465 ou 587
  secure: process.env.EMAIL_SECURE === 'true', // true si port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Création du dossier uploads s'il n'existe pas
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configuration CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `tree-${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Accès refusé. Token manquant.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trees', authMiddleware, treeRoutes);
app.use('/api/avis', authMiddleware, avisRoutes); // Utilisation correcte des routes avis
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);

// Route de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Champs manquants' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route d'inscription
app.post('/api/auth/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur ou email existant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'user',
      avatar: req.file ? req.file.filename : null
    });

    await newUser.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Route pour créer un admin
app.post('/api/auth/create-admin', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Nom déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'admin',
      avatar: req.file ? req.file.filename : null
    });

    await newUser.save();
    res.status(201).json({ message: 'Admin créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer un utilisateur simple
app.post('/api/auth/create-user', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Nom déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      profession,
      role: 'user',
      avatar: req.file ? req.file.filename : null
    });

    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour lister tous les utilisateurs
app.get('/api/auth/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour lister les utilisateurs simples
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour lister les admins
app.get('/api/admins', authMiddleware, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Serve les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});