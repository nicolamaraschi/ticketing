const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ottieni tutti i messaggi di un ticket
const getMessagesByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Verifica che il ticket esista
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trovato' });
    }

    // Verifica autorizzazioni
    if (
      req.user.role === 'CLIENT' && ticket.createdById !== userId ||
      req.user.role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null
    ) {
      return res.status(403).json({ message: 'Non sei autorizzato a visualizzare questi messaggi' });
    }

    const messages = await prisma.message.findMany({
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

    res.status(200).json(messages);
  } catch (error) {
    console.error('Errore nel recupero dei messaggi:', error);
    res.status(500).json({ message: 'Errore nel recupero dei messaggi' });
  }
};

// Crea un nuovo messaggio
const createMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verifica che il ticket esista
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedTo: true
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trovato' });
    }

    // Verifica autorizzazioni
    if (
      req.user.role === 'CLIENT' && ticket.createdById !== userId ||
      req.user.role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null
    ) {
      return res.status(403).json({ message: 'Non sei autorizzato ad aggiungere messaggi a questo ticket' });
    }

    // Aggiorna lo stato del ticket quando vengono aggiunti messaggi
    let ticketStatus = ticket.status;
    
    // Se è un cliente che risponde a un ticket risolto, lo rimette in lavorazione
    if (req.user.role === 'CLIENT' && ticket.status === 'RESOLVED') {
      ticketStatus = 'IN_PROGRESS';
    }
    
    // Se è un operatore che risponde a un ticket in attesa, lo mette in lavorazione
    if ((req.user.role === 'SUPPORT' || req.user.role === 'ADMIN') && ticket.status === 'OPEN') {
      ticketStatus = 'IN_PROGRESS';
    }
    
    // Se il ticket non è assegnato e un operatore risponde, viene assegnato a lui
    let assignedToId = ticket.assignedToId;
    if ((req.user.role === 'SUPPORT' || req.user.role === 'ADMIN') && !ticket.assignedToId) {
      assignedToId = userId;
    }

    // Aggiorna il ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status: ticketStatus,
        assignedToId
      }
    });

    const message = await prisma.message.create({
      data: {
        content,
        userId,
        ticketId
      },
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

    res.status(201).json(message);
  } catch (error) {
    console.error('Errore nella creazione del messaggio:', error);
    res.status(500).json({ message: 'Errore nella creazione del messaggio' });
  }
};

module.exports = {
  getMessagesByTicketId,
  createMessage
};