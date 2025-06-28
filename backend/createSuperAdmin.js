const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('Superadmin déjà créé');
      return;
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superadmin = new User({
      username: 'superadmin',
      password: hashedPassword,
      role: 'superadmin',
      email: 'superadmin@example.com',
      fullName: 'Super Admin'
    });

    await superadmin.save();
    console.log('Superadmin créé avec succès');
  } catch (err) {
    console.error('Erreur création superadmin:', err);
  }
})();
