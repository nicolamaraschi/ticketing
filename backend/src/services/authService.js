const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Registra un nuovo utente
const register = async (userData) => {
  const existingUser = await userModel.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email già registrata');
  }

  // Hash della password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Crea un nuovo utente
  const user = await userModel.createUser({
    ...userData,
    password: hashedPassword
  });

  // Genera token JWT
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

// Login utente
const login = async (email, password) => {
  // Verifica se l'utente esiste
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    throw new Error('Utente non trovato');
  }

  // Verifica la password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Password non valida');
  }

  // Genera token JWT
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

// Verifica token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token non valido o scaduto');
  }
};

// Genera token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Ottieni utente corrente
const getCurrentUser = async (userId) => {
  const user = await userModel.getUserById(userId);
  if (!user) {
    throw new Error('Utente non trovato');
  }
  return user;
};

module.exports = {
  register,
  login,
  verifyToken,
  generateToken,
  getCurrentUser
};