const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ottieni tutti i messaggi di un ticket
const getMessagesByTicketId = async (ticketId) => {
  return await prisma.message.findMany({
    where: { ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

// Crea un nuovo messaggio
const createMessage = async (messageData) => {
  return await prisma.message.create({
    data: messageData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
};

// Elimina un messaggio
const deleteMessage = async (id) => {
  return await prisma.message.delete({
    where: { id }
  });
};

// Conta messaggi non letti per un utente
const countUnreadMessages = async (userId, ticketId) => {
  // Qui implementeresti la logica per contare i messaggi non letti
  // Potresti aver bisogno di aggiungere un campo "read" al modello Message in Prisma
  return 0;
};

module.exports = {
  getMessagesByTicketId,
  createMessage,
  deleteMessage,
  countUnreadMessages
};