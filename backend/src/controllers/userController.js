const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ottieni tutti gli utenti (solo per admin e supporto)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPPORT') {
      return res.status(403).json({ message: 'Non autorizzato ad accedere a questa risorsa' });
    }

    const users = await prisma.user.findMany({
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

    res.status(200).json(users);
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    res.status(500).json({ message: 'Errore nel recupero degli utenti' });
  }
};

// Ottieni tutti gli operatori di supporto (per assegnare ticket)
const getSupportUsers = async (req, res) => {
  try {
    const supportUsers = await prisma.user.findMany({
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

    res.status(200).json(supportUsers);
  } catch (error) {
    console.error('Errore nel recupero degli operatori:', error);
    res.status(500).json({ message: 'Errore nel recupero degli operatori' });
  }
};

// Ottieni utente per ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Errore nel recupero dell\'utente:', error);
    res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
  }
};

module.exports = {
  getAllUsers,
  getSupportUsers,
  getUserById
};