const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Ottieni tutti i ticket in base al ruolo dell'utente
const getAllTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    let tickets;

    const filter = status ? { status } : {};

    // Se è cliente, mostra solo i propri ticket
    if (req.user.role === 'CLIENT') {
      tickets = await prisma.ticket.findMany({
        where: {
          ...filter,
          createdById: userId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } 
    // Se è operatore, mostra i ticket assegnati
    else if (req.user.role === 'SUPPORT') {
      tickets = await prisma.ticket.findMany({
        where: {
          ...filter,
          OR: [
            { assignedToId: userId },
            { assignedToId: null }
          ]
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } 
    // Se è admin, mostra tutti i ticket
    else {
      tickets = await prisma.ticket.findMany({
        where: filter,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Errore nel recupero dei ticket:', error);
    res.status(500).json({ message: 'Errore nel recupero dei ticket' });
  }
};

// Ottieni un ticket specifico
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        messages: {
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
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trovato' });
    }

    // Verifica autorizzazioni
    if (req.user.role === 'CLIENT' && ticket.createdById !== userId) {
      return res.status(403).json({ message: 'Non sei autorizzato a visualizzare questo ticket' });
    }

    if (req.user.role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null) {
      return res.status(403).json({ message: 'Non sei autorizzato a visualizzare questo ticket' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Errore nel recupero del ticket:', error);
    res.status(500).json({ message: 'Errore nel recupero del ticket' });
  }
};

// Crea un nuovo ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const userId = req.user.id;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        createdById: userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Errore nella creazione del ticket:', error);
    res.status(500).json({ message: 'Errore nella creazione del ticket' });
  }
};

// Aggiorna lo stato di un ticket
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Stato non valido' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trovato' });
    }

    // Solo operatori di supporto o admin possono aggiornare lo stato
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ message: 'Non sei autorizzato a modificare lo stato del ticket' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato del ticket:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dello stato del ticket' });
  }
};

// Assegna ticket a un operatore
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    // Verifica se l'operatore esiste
    if (assignedToId) {
      const operator = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          role: {
            in: ['SUPPORT', 'ADMIN']
          }
        }
      });

      if (!operator) {
        return res.status(404).json({ message: 'Operatore non trovato o non autorizzato' });
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { 
        assignedToId,
        status: assignedToId ? 'IN_PROGRESS' : 'OPEN'
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Errore nell\'assegnazione del ticket:', error);
    res.status(500).json({ message: 'Errore nell\'assegnazione del ticket' });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket
};