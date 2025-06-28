const User = require('../models/User');

// Liste des utilisateurs simples (role === 'user')
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password'); // ne pas renvoyer le password
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Liste des admins (role === 'admin' ou 'superadmin')
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
