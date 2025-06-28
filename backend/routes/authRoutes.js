const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Multer config avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Seules les images jpeg/jpg/png/gif sont acceptées'));
  }
}).single('avatar');

// Routes publiques
router.post('/login', authController.login);
router.post('/register', uploadAvatar, authController.register);
router.post('/reset-superadmin', authController.resetSuperadmin);

router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Routes protégées
router.post('/create-admin', verifyToken, uploadAvatar, authController.createAdmin);
router.post('/create-user', verifyToken, uploadAvatar, authController.createUser);

router.get('/users', verifyToken, authController.listUsers);

router.post('/logout', authController.logout);

module.exports = router;
