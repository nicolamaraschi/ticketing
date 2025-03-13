const messageModel = require('../models/messageModel');
const ticketModel = require('../models/ticketModel');

// Ottieni tutti i messaggi di un ticket
const getMessagesByTicketId = async (ticketId, userId, role) => {
  // Verifica che il ticket esista
  const ticket = await ticketModel.getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket non trovato');
  }

  // Verifica autorizzazioni
  if (
    role === 'CLIENT' && ticket.createdById !== userId ||
    role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null
  ) {
    throw new Error('Non sei autorizzato a visualizzare questi messaggi');
  }

  return await messageModel.getMessagesByTicketId(ticketId);
};

// Crea un nuovo messaggio
const createMessage = async (ticketId, content, userId, role) => {
  // Verifica che il ticket esista
  const ticket = await ticketModel.getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket non trovato');
  }

  // Verifica autorizzazioni
  if (
    role === 'CLIENT' && ticket.createdById !== userId ||
    role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null
  ) {
    throw new Error('Non sei autorizzato ad aggiungere messaggi a questo ticket');
  }

  // Aggiorna lo stato del ticket quando vengono aggiunti messaggi
  let ticketStatus = ticket.status;
  let assignedToId = ticket.assignedToId;
  
  // Se è un cliente che risponde a un ticket risolto, lo rimette in lavorazione
  if (role === 'CLIENT' && ticket.status === 'RESOLVED') {
    ticketStatus = 'IN_PROGRESS';
  }
  
  // Se è un operatore che risponde a un ticket in attesa, lo mette in lavorazione
  if ((role === 'SUPPORT' || role === 'ADMIN') && ticket.status === 'OPEN') {
    ticketStatus = 'IN_PROGRESS';
  }
  
  // Se il ticket non è assegnato e un operatore risponde, viene assegnato a lui
  if ((role === 'SUPPORT' || role === 'ADMIN') && !ticket.assignedToId) {
    assignedToId = userId;
  }

  // Aggiorna il ticket
  await ticketModel.updateTicket(ticketId, { 
    status: ticketStatus,
    assignedToId,
    updatedAt: new Date()
  });

  // Crea il messaggio
  return await messageModel.createMessage({
    content,
    userId,
    ticketId
  });
};

module.exports = {
  getMessagesByTicketId,
  createMessage
};