const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ottieni tutti i ticket
const getAllTickets = async (filter = {}) => {
  return await prisma.ticket.findMany({
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
};

// Ottieni i ticket di un utente
const getTicketsByUserId = async (userId, status) => {
  const filter = { createdById: userId };
  if (status) {
    filter.status = status;
  }

  return await prisma.ticket.findMany({
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
};

// Ottieni i ticket assegnati a un operatore
const getTicketsByAssignedId = async (assignedToId, status) => {
  const filter = { assignedToId };
  if (status) {
    filter.status = status;
  }

  return await prisma.ticket.findMany({
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
};

// Ottieni i ticket non assegnati
const getUnassignedTickets = async (status) => {
  const filter = { assignedToId: null };
  if (status) {
    filter.status = status;
  }

  return await prisma.ticket.findMany({
    where: filter,
    include: {
      createdBy: {
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
};

// Ottieni un ticket specifico
const getTicketById = async (id) => {
  return await prisma.ticket.findUnique({
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
};

// Crea un nuovo ticket
const createTicket = async (ticketData) => {
  return await prisma.ticket.create({
    data: ticketData,
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
};

// Aggiorna un ticket
const updateTicket = async (id, ticketData) => {
  return await prisma.ticket.update({
    where: { id },
    data: ticketData,
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
      }
    }
  });
};

// Elimina un ticket
const deleteTicket = async (id) => {
  return await prisma.ticket.delete({
    where: { id }
  });
};

module.exports = {
  getAllTickets,
  getTicketsByUserId,
  getTicketsByAssignedId,
  getUnassignedTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};