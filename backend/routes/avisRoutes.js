const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Avis = require('../models/Avis');     // Assure-toi que ce chemin est correct
const Tree = require('../models/Tree');     // Assure-toi que ce chemin est correct

// Middleware d'authentification simple (à remplacer par ton vrai middleware si tu en as un)
const authMiddleware = (req, res, next) => {
  // Exemple : si tu as un token JWT, vérifie-le ici
  // Pour l'exemple, on autorise tout :
  req.user = { _id: '123456789012345678901234' }; // Simule un user connecté (à remplacer)
  next();
};

// Route POST pour créer un avis
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { treeId, ratings } = req.body;

    if (!treeId || !ratings) {
      return res.status(400).json({ error: 'treeId et ratings sont requis' });
    }

    // Vérifie que treeId est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(treeId)) {
      return res.status(400).json({ error: 'treeId invalide' });
    }

    // Vérifie que l'arbre existe
    const tree = await Tree.findById(treeId);
    if (!tree) {
      return res.status(404).json({ error: 'Arbre non trouvé' });
    }

    // Création de l'avis
    const newAvis = new Avis({
      treeId: treeId,
      userId: req.user.id,
      ratings,
      createdAt: new Date(),
    });

    await newAvis.save();

    res.status(201).json({ message: 'Avis enregistré avec succès' });
  } catch (error) {
    console.error('Erreur serveur lors de l\'enregistrement de l\'avis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de l\'avis' });
  }
});

module.exports = router;
