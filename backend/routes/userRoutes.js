const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // supposé gérer l'auth et le rôle

// Protège les routes avec authMiddleware et un check de rôle si besoin
router.get('/users', authMiddleware, userController.getUsers);
router.get('/admins', authMiddleware, userController.getAdmins);

module.exports = router;
