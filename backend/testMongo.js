const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('Chemin .env:', path.resolve(__dirname, '..', '.env'));
console.log('EMAIL_USER =', process.env.EMAIL_USER);
console.log('EMAIL_PASS =', process.env.EMAIL_PASS);
console.log('MONGO_URI =', process.env.MONGO_URI);
console.log('JWT_SECRET =', process.env.JWT_SECRET);
