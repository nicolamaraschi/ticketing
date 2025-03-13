'use client';
import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Modifica l'importazione di socket.io-client
import io from 'socket.io-client';

import { useAuth } from './AuthContext';
import { Message, TypingNotification } from '../types/index';

// Definisci manualmente l'interfaccia Socket se necessario
interface Socket {
  on: (event: string, callback: any) => void;
  emit: (event: string, ...args: any[]) => void;
  disconnect: () => void;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinTicketRoom: (ticketId: string) => void;
  leaveTicketRoom: (ticketId: string) => void;
  sendMessage: (ticketId: string, content: string) => void;
  startTyping: (ticketId: string) => void;
  stopTyping: (ticketId: string) => void;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, TypingNotification[]>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingNotification[]>>({});

  // Inizializzazione socket quando l'utente è autenticato
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });

    // Gestione messaggi in arrivo
    socketInstance.on('message', (message: Message) => {
      setMessages(prev => {
        const ticketMessages = prev[message.ticketId] || [];
        return {
          ...prev,
          [message.ticketId]: [...ticketMessages, message]
        };
      });
    });

    // Gestione notifiche di digitazione
    socketInstance.on('user-typing', (notification: TypingNotification & { ticketId: string }) => {
      const { ticketId, ...typingData } = notification;
      
      setTypingUsers(prev => {
        const ticketTypingUsers = prev[ticketId] || [];
        const filteredUsers = ticketTypingUsers.filter(user => user.userId !== typingData.userId);
        
        return {
          ...prev,
          [ticketId]: typingData.isTyping 
            ? [...filteredUsers, typingData]
            : filteredUsers
        };
      });
    });

    setSocket(socketInstance);

    // Pulizia alla disconnessione
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token]);

  // Funzione per entrare in una stanza di ticket
  const joinTicketRoom = (ticketId: string) => {
    if (socket && isConnected) {
      socket.emit('join-ticket', ticketId);
    }
  };

  // Funzione per uscire da una stanza di ticket
  const leaveTicketRoom = (ticketId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-ticket', ticketId);
    }
  };

  // Funzione per inviare un messaggio
  const sendMessage = (ticketId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('new-message', { ticketId, content });
    }
  };

  // Funzione per iniziare la digitazione
  const startTyping = (ticketId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', { ticketId, isTyping: true });
    }
  };

  // Funzione per terminare la digitazione
  const stopTyping = (ticketId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', { ticketId, isTyping: false });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTicketRoom,
        leaveTicketRoom,
        sendMessage,
        startTyping,
        stopTyping,
        messages,
        typingUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};