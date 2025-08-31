const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ton modèle User
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// GET /api/admins - liste uniquement les users avec role 'admin' ou 'superadmin'
router.get('/', verifyToken, checkRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }, '-password').lean();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admins/:id - modifier un admin
router.put('/:id', verifyToken, checkRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { username, email, role, fullName, profession, profileImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, fullName, profession, profileImage },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password').lean();

    if (!updatedUser) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/admins/:id - supprimer un admin
router.delete('/:id', verifyToken, checkRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
