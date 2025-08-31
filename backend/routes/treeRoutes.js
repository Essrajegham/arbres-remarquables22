const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Tree = require('../models/Tree');
const { verifyToken } = require('../middlewares/authMiddleware');

// Middleware de validation des coordonnées GPS
const validateCoordinates = (req, res, next) => {
  try {
    if (req.body.location) {
      const location = typeof req.body.location === 'string' 
        ? JSON.parse(req.body.location) 
        : req.body.location;

      const coords = location.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) {
        throw new Error('Coordonnées GPS invalides');
      }

      const [lng, lat] = coords.map(parseFloat);
      if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
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

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Vérification des permissions
const checkTreePermissions = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Non authentifié' });

  const { role, id: userId } = req.user;
  const isAdmin = ['admin', 'superadmin'].includes(role);
  
  // Pour les routes nécessitant la propriété
  if (req.params.id) {
    Tree.findById(req.params.id)
      .then(tree => {
        if (!tree) return res.status(404).json({ success: false, error: 'Arbre non trouvé' });
        
        const isOwner = tree.addedBy && tree.addedBy.toString() === userId;
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ 
            success: false, 
            error: 'Permissions insuffisantes' 
          });
        }
        
        req.tree = tree;
        next();
      })
      .catch(err => res.status(500).json({ 
        success: false, 
        error: 'Erreur serveur' 
      }));
  } else {
    next();
  }
};

// Routes
router.get('/', async (req, res) => {
  try {
    const trees = await Tree.find();
    res.json({ success: true, trees });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur' 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return res.status(404).json({ 
        success: false, 
        error: 'Arbre non trouvé' 
      });
    }
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur' 
    });
  }
});

router.post(
  '/',
  verifyToken,
  upload.array('images', 5),
  validateCoordinates,
  async (req, res) => {
    try {
      const { id: addedBy } = req.user;
      const imagePaths = req.files.map(file => file.path);
      
      const tree = new Tree({
        ...req.body,
        images: imagePaths,
        addedBy
      });

      await tree.save();
      res.status(201).json({ success: true, tree });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erreur création arbre' 
      });
    }
  }
);

router.put(
  '/:id',
  verifyToken,
  checkTreePermissions,
  upload.array('images', 5),
  validateCoordinates,
  async (req, res) => {
    try {
      const updates = req.body;
      if (req.files?.length > 0) {
        updates.images = req.files.map(file => file.path);
      }

      const updatedTree = await Tree.findByIdAndUpdate(
        req.params.id, 
        updates, 
        { new: true }
      );

      res.json({ success: true, tree: updatedTree });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erreur modification' 
      });
    }
  }
);

router.delete(
  '/:id',
  verifyToken,
  checkTreePermissions,
  async (req, res) => {
    try {
      await Tree.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Arbre supprimé' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erreur suppression' 
      });
    }
  }
);

module.exports = router;