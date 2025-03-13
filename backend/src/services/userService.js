const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

// Ottieni tutti gli utenti
const getAllUsers = async (role) => {
  // Verifica autorizzazioni
  if (role !== 'ADMIN' && role !== 'SUPPORT') {
    throw new Error('Non sei autorizzato ad accedere a questa risorsa');
  }

  return await userModel.getAllUsers();
};

// Ottieni utente per ID
const getUserById = async (id) => {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new Error('Utente non trovato');
  }
  return user;
};

// Ottieni tutti gli operatori di supporto
const getSupportUsers = async () => {
  return await userModel.getSupportUsers();
};

// Crea un nuovo utente (solo admin)
const createUser = async (userData, currentUserRole) => {
  // Verifica autorizzazioni
  if (currentUserRole !== 'ADMIN') {
    throw new Error('Solo gli amministratori possono creare nuovi utenti');
  }

  // Verifica se l'utente esiste già
  const existingUser = await userModel.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email già registrata');
  }

  // Hash della password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Crea un nuovo utente
  return await userModel.createUser({
    ...userData,
    password: hashedPassword
  });
};

// Aggiorna un utente
const updateUser = async (id, userData, currentUserId, currentUserRole) => {
  // Verifica se l'utente esiste
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new Error('Utente non trovato');
  }

  // Verifica autorizzazioni
  if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
    throw new Error('Non sei autorizzato ad aggiornare questo utente');
  }

  // Se la password è inclusa, esegui l'hash
  let dataToUpdate = { ...userData };
  if (userData.password) {
    dataToUpdate.password = await bcrypt.hash(userData.password, 10);
  }

  // Non permettere agli utenti non-admin di cambiare il proprio ruolo
  if (currentUserRole !== 'ADMIN' && dataToUpdate.role) {
    delete dataToUpdate.role;
  }

  return await userModel.updateUser(id, dataToUpdate);
};

// Elimina un utente (solo admin)
const deleteUser = async (id, currentUserRole) => {
  // Verifica autorizzazioni
  if (currentUserRole !== 'ADMIN') {
    throw new Error('Solo gli amministratori possono eliminare utenti');
  }

  // Verifica se l'utente esiste
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new Error('Utente non trovato');
  }

  return await userModel.deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  getSupportUsers,
  createUser,
  updateUser,
  deleteUser
};