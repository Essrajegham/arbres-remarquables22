const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const User = require('./models/User');
const avisRoutes = require('./routes/avisRoutes');
const treeRoutes = require('./routes/treeRoutes');
const { verifyToken } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Créer dossier uploads s'il n'existe pas
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Middlewares globaux
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

// Multer configuration pour gestion fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `tree-${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Routes protégées (JWT)
app.use('/api/avis', verifyToken, avisRoutes);
app.use('/api/trees', verifyToken, treeRoutes);

// --- Authentification ---

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Champs manquants' });

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

// Register
app.post('/api/auth/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: 'Utilisateur ou email existant' });

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

// Création admin (protégé)
app.post('/api/auth/create-admin', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession)
      return res.status(400).json({ error: 'Tous les champs sont requis' });

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

// Création utilisateur simple (protégé)
app.post('/api/auth/create-user', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { username, password, fullName, email, profession } = req.body;
    if (!username || !password || !fullName || !email || !profession)
      return res.status(400).json({ error: 'Tous les champs sont requis' });

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

// Listes utilisateurs/admins (protégé)
app.get('/api/auth/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admins', verifyToken, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrer serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
