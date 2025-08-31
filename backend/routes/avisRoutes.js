const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /api/avis - Créer un avis
router.post('/', verifyToken, avisController.createAvis);

// GET /api/avis - Tous les avis
router.get('/', verifyToken, avisController.getAllAvis);

// GET /api/avis/:treeId - Avis par arbre
router.get('/:treeId', avisController.getAvisByTree);

module.exports = router;