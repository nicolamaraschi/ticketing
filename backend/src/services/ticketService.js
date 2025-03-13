const ticketModel = require('../models/ticketModel');
const userModel = require('../models/userModel');

// Ottieni tutti i ticket in base al ruolo dell'utente
const getAllTickets = async (userId, role, status) => {
  let tickets = [];

  // Se è cliente, mostra solo i propri ticket
  if (role === 'CLIENT') {
    tickets = await ticketModel.getTicketsByUserId(userId, status);
  } 
  // Se è operatore, mostra i ticket assegnati e quelli non assegnati
  else if (role === 'SUPPORT') {
    const assignedTickets = await ticketModel.getTicketsByAssignedId(userId, status);
    const unassignedTickets = await ticketModel.getUnassignedTickets(status);
    tickets = [...assignedTickets, ...unassignedTickets];
  } 
  // Se è admin, mostra tutti i ticket
  else if (role === 'ADMIN') {
    const filter = status ? { status } : {};
    tickets = await ticketModel.getAllTickets(filter);
  }

  return tickets;
};

// Ottieni un ticket specifico
const getTicketById = async (ticketId, userId, role) => {
  const ticket = await ticketModel.getTicketById(ticketId);

  if (!ticket) {
    throw new Error('Ticket non trovato');
  }

  // Verifica autorizzazioni
  if (role === 'CLIENT' && ticket.createdById !== userId) {
    throw new Error('Non sei autorizzato a visualizzare questo ticket');
  }

  if (role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null) {
    throw new Error('Non sei autorizzato a visualizzare questo ticket');
  }

  return ticket;
};

// Crea un nuovo ticket
const createTicket = async (ticketData, userId) => {
  const newTicket = {
    title: ticketData.title,
    description: ticketData.description,
    priority: ticketData.priority || 'MEDIUM',
    createdById: userId
  };

  return await ticketModel.createTicket(newTicket);
};

// Aggiorna lo stato di un ticket
const updateTicketStatus = async (ticketId, status, userId, role) => {
  // Verifica che il ticket esista
  const ticket = await ticketModel.getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket non trovato');
  }

  // Verifica che l'utente sia autorizzato
  if (role === 'CLIENT') {
    throw new Error('Non sei autorizzato a modificare lo stato del ticket');
  }

  // Aggiorna lo stato
  return await ticketModel.updateTicket(ticketId, { status });
};

// Assegna ticket a un operatore
const assignTicket = async (ticketId, assignedToId, userId, role) => {
  // Verifica che il ticket esista
  const ticket = await ticketModel.getTicketById(ticketId);
  if (!ticket) {
    throw new Error('Ticket non trovato');
  }

  // Verifica che l'utente sia autorizzato
  if (role === 'CLIENT') {
    throw new Error('Non sei autorizzato ad assegnare ticket');
  }

  // Verifica se l'operatore esiste
  if (assignedToId) {
    const operator = await userModel.getUserById(assignedToId);
    if (!operator || (operator.role !== 'SUPPORT' && operator.role !== 'ADMIN')) {
      throw new Error('Operatore non trovato o non autorizzato');
    }
  }

  // Aggiorna il ticket
  return await ticketModel.updateTicket(ticketId, { 
    assignedToId,
    status: assignedToId ? 'IN_PROGRESS' : 'OPEN'
  });
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket
};