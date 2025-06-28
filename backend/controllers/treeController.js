const proj4 = require('proj4');
const Tree = require('../models/Tree');

// Définitions des projections
proj4.defs('EPSG:22391', '+proj=tmerc +lat_0=36.66666666666666 +lon_0=10 +k=0.9998 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

exports.createTree = async (req, res) => {
  try {
    const coords = req.body.location?.coordinates;

    // Vérifier présence et format des coordonnées
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return res.status(400).json({
        success: false,
        error: "Coordonnées manquantes ou invalides"
      });
    }

    // Conversion EPSG:22391 (proj) vers EPSG:4326 (GPS)
    const [lng, lat] = proj4('EPSG:22391', 'EPSG:4326', coords);

    // Validation lat/lng GPS
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: `Coordonnées invalides (lat: ${lat}, lng: ${lng})`
      });
    }

    // Remplacement des coordonnées projetées par les coordonnées GPS pour la sauvegarde
    req.body.location.coordinates = [lng, lat];

    // Création et sauvegarde de l'arbre
    const tree = new Tree(req.body);
    await tree.save();

    res.status(201).json({
      success: true,
      data: tree
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
