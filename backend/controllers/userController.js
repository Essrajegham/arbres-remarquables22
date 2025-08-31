// controllers/userController.js
const User = require('../models/User');

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    // Filtrage, tri et pagination
    const { role, sort, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    
    const sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });

  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, fullName, profession } = req.body;
    
    // Validation
    if (!username || !email || !role || !fullName || !profession) {
      return res.status(400).json({ 
        success: false,
        error: 'Tous les champs sont requis' 
      });
    }

    // Empêcher un utilisateur de modifier son propre rôle
    if (req.user.id === id && req.body.role !== req.user.role) {
      return res.status(403).json({ 
        success: false,
        error: 'Vous ne pouvez pas modifier votre propre rôle' 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, role, fullName, profession },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    res.json({ 
      success: true,
      user: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    });

  } catch (err) {
    console.error('UpdateUser error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: err.message 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Nom d\'utilisateur ou email déjà utilisé' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher un utilisateur de se supprimer lui-même
    if (req.user.id === id) {
      return res.status(403).json({ 
        success: false,
        error: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    res.json({ 
      success: true,
      message: 'Utilisateur supprimé avec succès',
      userId: id
    });

  } catch (err) {
    console.error('DeleteUser error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};

// Obtenir un utilisateur spécifique
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
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
    console.error('GetUser error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};