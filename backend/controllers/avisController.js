const Avis = require('../models/Avis');

// Créer un nouvel avis
exports.createAvis = async (req, res) => {
  try {
    const { tree, comment, ratings } = req.body;
    
    // Validation des données requises
    if (!tree) {
      return res.status(400).json({ 
        success: false,
        error: "L'ID de l'arbre est requis" 
      });
    }

    const newAvis = new Avis({
      tree,
      user: req.user.id,
      comment: comment || '',
      ratings: {
        airQuality: ratings?.airQuality || 0,
        cleanliness: ratings?.cleanliness || 0,
        noiseLevel: ratings?.noiseLevel || 0,
        accessibility: ratings?.accessibility || 0,
        treeCondition: ratings?.treeCondition || 0
      },
      date: new Date()
    });

    const savedAvis = await newAvis.save();
    
    res.status(201).json({
      success: true,
      data: {
        _id: savedAvis._id,
        tree: savedAvis.tree,
        user: savedAvis.user,
        comment: savedAvis.comment,
        ratings: savedAvis.ratings,
        date: savedAvis.date
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Récupérer tous les avis
exports.getAllAvis = async (req, res) => {
  try {
    const avis = await Avis.find()
      .populate('user', 'username avatar')
      .populate('tree', 'name species')
      .sort({ date: -1 });

    const formatted = avis.map(avi => ({
      _id: avi._id,
      username: avi.user?.username || 'Utilisateur inconnu',
      avatar: avi.user?.avatar || null,
      treeName: avi.tree?.name || 'Arbre inconnu',
      treeSpecies: avi.tree?.species || 'Espèce inconnue',
      comment: avi.comment,
      ratings: avi.ratings,
      date: avi.date,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur', 
      details: err.message 
    });
  }
};

// Récupérer les avis pour un arbre
exports.getAvisByTree = async (req, res) => {
  try {
    const avis = await Avis.find({ tree: req.params.treeId })
      .populate('user', 'username avatar')
      .sort({ date: -1 });

    res.json({ 
      success: true,
      data: avis.map(avi => ({
        _id: avi._id,
        user: {
          _id: avi.user?._id,
          username: avi.user?.username,
          avatar: avi.user?.avatar
        },
        comment: avi.comment,
        ratings: avi.ratings,
        date: avi.date
      }))
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};