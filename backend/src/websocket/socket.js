const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Struttura per tenere traccia delle connessioni
const connections = {
  // userId: socketId
};

// Struttura per tenere traccia delle stanze (ticket)
const rooms = {
  // ticketId: [userIds]
};

const setupWebsocket = (io) => {
  // Middleware per autenticazione
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);
    
    // Salva la connessione
    connections[userId] = socket.id;

    // Gestione join a una stanza (ticket)
    socket.on('join-ticket', async (ticketId) => {
      try {
        // Verifica se l'utente può accedere al ticket
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId }
        });

        if (!ticket) {
          socket.emit('error', { message: 'Ticket non trovato' });
          return;
        }

        // Verifica autorizzazioni
        if (
          socket.user.role === 'CLIENT' && ticket.createdById !== userId &&
          socket.user.role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null &&
          socket.user.role !== 'ADMIN'
        ) {
          socket.emit('error', { message: 'Non autorizzato ad accedere a questo ticket' });
          return;
        }

        // Unisciti alla stanza
        socket.join(ticketId);
        
        // Aggiorna la lista degli utenti nella stanza
        if (!rooms[ticketId]) {
          rooms[ticketId] = [];
        }
        
        if (!rooms[ticketId].includes(userId)) {
          rooms[ticketId].push(userId);
        }
        
        // Notifica tutti nella stanza
        io.to(ticketId).emit('user-joined', {
          userId,
          name: socket.user.name,
          time: new Date()
        });

        console.log(`User ${userId} joined ticket room ${ticketId}`);
      } catch (error) {
        console.error('Error joining ticket room:', error);
        socket.emit('error', { message: 'Errore durante l\'accesso al ticket' });
      }
    });

    // Gestione leave da una stanza
    socket.on('leave-ticket', (ticketId) => {
      socket.leave(ticketId);
      
      // Rimuovi l'utente dalla lista della stanza
      if (rooms[ticketId]) {
        rooms[ticketId] = rooms[ticketId].filter(id => id !== userId);
        
        // Se la stanza è vuota, rimuovila
        if (rooms[ticketId].length === 0) {
          delete rooms[ticketId];
        }
      }
      
      // Notifica tutti nella stanza
      io.to(ticketId).emit('user-left', {
        userId,
        name: socket.user.name,
        time: new Date()
      });

      console.log(`User ${userId} left ticket room ${ticketId}`);
    });

    // Gestione nuovo messaggio
    socket.on('new-message', async (data) => {
      try {
        const { ticketId, content } = data;

        // Verifica se il ticket esiste
        const ticket = await prisma.ticket.findUnique({
          where: { id: ticketId }
        });

        if (!ticket) {
          socket.emit('error', { message: 'Ticket non trovato' });
          return;
        }

        // Verifica autorizzazioni
        if (
          socket.user.role === 'CLIENT' && ticket.createdById !== userId ||
          socket.user.role === 'SUPPORT' && ticket.assignedToId !== userId && ticket.assignedToId !== null
        ) {
          socket.emit('error', { message: 'Non autorizzato ad inviare messaggi a questo ticket' });
          return;
        }

        // Aggiorna lo stato del ticket se necessario
        let ticketStatus = ticket.status;
        let assignedToId = ticket.assignedToId;
        
        // Se è un cliente che risponde a un ticket risolto, lo rimette in lavorazione
        if (socket.user.role === 'CLIENT' && ticket.status === 'RESOLVED') {
          ticketStatus = 'IN_PROGRESS';
        }
        
        // Se è un operatore che risponde a un ticket in attesa, lo mette in lavorazione
        if ((socket.user.role === 'SUPPORT' || socket.user.role === 'ADMIN') && ticket.status === 'OPEN') {
          ticketStatus = 'IN_PROGRESS';
        }
        
        // Se il ticket non è assegnato e un operatore risponde, viene assegnato a lui
        if ((socket.user.role === 'SUPPORT' || socket.user.role === 'ADMIN') && !ticket.assignedToId) {
          assignedToId = userId;
        }

        // Aggiorna il ticket
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { 
            status: ticketStatus,
            assignedToId,
            updatedAt: new Date()
          }
        });

        // Crea il messaggio nel database
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

        // Invia il messaggio a tutti nella stanza
        io.to(ticketId).emit('message', message);
        
        // Invia notifica di aggiornamento ticket a tutti
        io.emit('ticket-updated', {
          ticketId,
          status: ticketStatus,
          assignedToId
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Errore durante l\'invio del messaggio' });
      }
    });

    // Gestione digitazione
    socket.on('typing', (data) => {
      const { ticketId, isTyping } = data;
      
      // Invia a tutti tranne il mittente
      socket.to(ticketId).emit('user-typing', {
        userId,
        name: socket.user.name,
        isTyping
      });
    });

    // Gestione disconnessione
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      
      // Rimuovi la connessione
      delete connections[userId];
      
      // Rimuovi l'utente da tutte le stanze
      Object.keys(rooms).forEach(ticketId => {
        if (rooms[ticketId].includes(userId)) {
          rooms[ticketId] = rooms[ticketId].filter(id => id !== userId);
          
          // Se la stanza è vuota, rimuovila
          if (rooms[ticketId].length === 0) {
            delete rooms[ticketId];
          } else {
            // Notifica gli altri nella stanza
            io.to(ticketId).emit('user-left', {
              userId,
              name: socket.user.name,
              time: new Date()
            });
          }
        }
      });
    });
  });
};

module.exports = { setupWebsocket };