require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adapte si besoin

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = process.env;

    if (!SUPERADMIN_USERNAME || !SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
      throw new Error('Variables d’environnement superadmin manquantes');
    }

    const existingAdmin = await User.findOne({
      $or: [{ email: SUPERADMIN_EMAIL }, { username: SUPERADMIN_USERNAME }]
    });

    if (existingAdmin) {
      console.log('Superadmin déjà existant.');
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

    const superAdmin = new User({
      username: SUPERADMIN_USERNAME,
      email: SUPERADMIN_EMAIL,
      password: hashedPassword,
      role: 'superadmin',
      fullName: 'Super Admin',       // **Ajouter ici**
      profession: 'Administrateur'   // **Ajouter ici**
    });

    await superAdmin.save();
    console.log('Superadmin créé avec succès !');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Erreur création superadmin:', err);
    process.exit(1);
  }
}

createSuperAdmin();
