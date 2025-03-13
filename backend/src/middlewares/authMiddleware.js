const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Token non fornito.' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token non valido o scaduto.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accesso negato. Richiesti privilegi di amministratore.' });
  }
  next();
};

const isSupport = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPPORT') {
    return res.status(403).json({ message: 'Accesso negato. Richiesti privilegi di supporto.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  isSupport
};