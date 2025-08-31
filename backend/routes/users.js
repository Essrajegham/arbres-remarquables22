const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Modifier un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error('Erreur mise à jour utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
