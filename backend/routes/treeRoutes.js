const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tree = require('../models/Tree');
const { verifyToken } = require('../middlewares/authMiddleware');

// Middleware pour valider les coordonnées GPS
const validateCoordinates = (req, res, next) => {
  try {
    if (req.body.location) {
      const location = typeof req.body.location === 'string'
        ? JSON.parse(req.body.location)
        : req.body.location;

      const coords = location.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2)
        throw new Error('Coordonnées GPS invalides');

      let [lng, lat] = coords;
      lng = parseFloat(lng);
      lat = parseFloat(lat);

      if (
        isNaN(lng) || isNaN(lat) ||
        lng < -180 || lng > 180 ||
        lat < -90 || lat > 90
      ) {
        throw new Error('Coordonnées hors limites');
      }

      req.body.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }
    next();
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Configuration Multer pour l’upload des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // dossier de stockage
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Route GET : récupérer tous les arbres
router.get('/', async (req, res) => {
  try {
    const trees = await Tree.find();
    res.json({ success: true, trees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur serveur lors de la récupération des arbres" });
  }
});

// Route GET : récupérer un arbre par ID
router.get('/:id', async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return res.status(404).json({ success: false, error: "Arbre non trouvé" });
    }
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur serveur lors de la récupération de l'arbre" });
  }
});

// Route POST : ajouter un arbre remarquable
router.post(
  '/',
  verifyToken,
  upload.array('images', 5),
  validateCoordinates,
  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
      }

      const {
        name,
        species,
        age,
        height,
        circumference,
        address,
        district,
        location
      } = req.body;

      const imagePaths = req.files.map(file => file.path);

      const tree = new Tree({
        name,
        species,
        age,
        height,
        circumference,
        address,
        district,
        location,
        images: imagePaths,
        addedBy: req.user.id,
      });

      await tree.save();

      res.status(201).json({ success: true, tree });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Erreur serveur lors de l'ajout de l'arbre" });
    }
  }
);

module.exports = router;
