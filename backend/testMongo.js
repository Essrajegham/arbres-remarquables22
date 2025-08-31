require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connexion MongoDB réussie');
    process.exit(0);
  } catch (err) {
    console.error('Erreur connexion MongoDB:', err);
    process.exit(1);
  }
}

test();
