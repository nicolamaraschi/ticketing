const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ottieni tutti gli utenti
const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

// Ottieni utente per ID
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
};

// Ottieni utente per email
const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

// Crea nuovo utente
const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData
  });
};

// Aggiorna utente
const updateUser = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: userData
  });
};

// Elimina utente
const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id }
  });
};

// Ottieni gli operatori di supporto
const getSupportUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        in: ['SUPPORT', 'ADMIN']
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getSupportUsers
};