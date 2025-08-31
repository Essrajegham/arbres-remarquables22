const proj4 = require('proj4');
const Tree = require('../models/Tree');

// Définition des systèmes de coordonnées
proj4.defs('EPSG:22391', '+proj=tmerc +lat_0=36.66666666666666 +lon_0=10 +k=0.9998 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

// Fonction pour obtenir le prochain code séquentiel
const getNextTreeCode = async () => {
  try {
    // Trouver le dernier arbre pour déterminer le prochain code
    const lastTree = await Tree.findOne().sort({ code: -1 }).limit(1);
    
    let nextCode = 1;
    if (lastTree && lastTree.code) {
      // Si des arbres existent, prendre le code le plus élevé et incrémenter
      const lastCode = parseInt(lastTree.code);
      if (!isNaN(lastCode)) {
        nextCode = lastCode + 1;
      }
    }

    return nextCode.toString().padStart(4, '0'); // Formatte le code sur 4 chiffres (0001, 0002, etc.)
  } catch (error) {
    console.error('Erreur lors de la génération du code:', error);
    throw error;
  }
};

exports.createTree = async (req, res) => {
  try {
    // Validation des coordonnées
    const coords = req.body.location?.coordinates;

    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return res.status(400).json({ success: false, error: "Coordonnées manquantes ou invalides" });
    }

    // Conversion des coordonnées
    const [lng, lat] = proj4('EPSG:22391', 'EPSG:4326', coords);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false, 
        error: `Coordonnées invalides (lat: ${lat}, lng: ${lng})` 
      });
    }

    // Génération du code séquentiel
    const treeCode = await getNextTreeCode();

    // Création de l'arbre
    const tree = new Tree({
      ...req.body,
      code: treeCode,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });

    await tree.save();

    res.status(201).json({ 
      success: true, 
      data: tree,
      message: `Arbre ajouté avec succès (Code: ${treeCode})`
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'arbre:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création de l\'arbre' 
    });
  }
};

// Fonction optionnelle pour réinitialiser les codes existants
exports.resetTreeCodes = async (req, res) => {
  try {
    const trees = await Tree.find().sort({ createdAt: 1 });
    
    for (let i = 0; i < trees.length; i++) {
      trees[i].code = (i + 1).toString().padStart(4, '0');
      await trees[i].save();
    }
    
    res.status(200).json({
      success: true,
      message: `Codes réinitialisés pour ${trees.length} arbres`
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des codes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la réinitialisation des codes'
    });
  }
};