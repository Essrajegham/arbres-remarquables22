const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: 'Token non fourni' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        error: 'Token invalide',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
      });
    }
    req.user = decoded;
    next();
  });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };