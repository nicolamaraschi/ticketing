'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Message, Ticket } from '../../types';
import { messagesApi } from '../../lib/api';
import './TicketChat.css';

interface TicketChatProps {
  ticket: Ticket;
}

const TicketChat: React.FC<TicketChatProps> = ({ ticket }) => {
  const { user } = useAuth();
  const { 
    joinTicketRoom, 
    leaveTicketRoom, 
    sendMessage, 
    startTyping, 
    stopTyping, 
    typingUsers, 
    socket,
    isConnected 
  } = useSocket();
  const [messages, setMessages] = useState<Message[]>(ticket.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ticketTypingUsers = typingUsers[ticket.id] || [];
  const filteredTypingUsers = ticketTypingUsers.filter(u => u.userId !== user?.id);

  // Funzione per verificare se l'utente può inviare messaggi
  const canSendMessages = () => {
    if (!user) return false;
    
    // Se ticket è chiuso, nessuno può inviare messaggi
    if (ticket.status === 'CLOSED') return false;
    
    // Se l'utente è cliente, può inviare messaggi solo ai suoi ticket
    if (user.role === 'CLIENT') {
      return ticket.createdBy.id === user.id;
    }
    
    // Se l'utente è supporto, può inviare messaggi solo ai ticket assegnati o non assegnati
    if (user.role === 'SUPPORT') {
      return ticket.assignedTo?.id === user.id || !ticket.assignedTo;
    }
    
    // Gli admin possono inviare messaggi a tutti i ticket
    return true;
  };

  // Carica messaggi quando il componente si monta
  useEffect(() => {
    const fetchMessages = async () => {
      if (!ticket.messages) {
        try {
          setIsLoading(true);
          setError(null);
          const data = await messagesApi.getByTicketId(ticket.id);
          setMessages(data);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Impossibile caricare i messaggi. Riprova più tardi.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();
  }, [ticket.id, ticket.messages]);

  // Gestione WebSocket per la chat
  useEffect(() => {
    // Entra nella stanza del ticket
    joinTicketRoom(ticket.id);
    
    // Cleanup alla chiusura
    return () => {
      leaveTicketRoom(ticket.id);
    };
  }, [joinTicketRoom, leaveTicketRoom, ticket.id]);

  // Listener per nuovi messaggi dal socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handler per nuovi messaggi
    const handleNewMessage = (message: Message) => {
      if (message.ticketId === ticket.id) {
        setMessages(prevMessages => {
          // Verifica se il messaggio esiste già (per evitare duplicati)
          const messageExists = prevMessages.some(m => m.id === message.id);
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      }
    };

    // Ascolta l'evento 'message' dal server
    socket.on('message', handleNewMessage);

    // Pulizia del listener
    return () => {
      socket.off('message', handleNewMessage);
    };
  }, [socket, isConnected, ticket.id]);

  // Gestione invio messaggio
  const handleSendMessage = (content: string) => {
    if (canSendMessages()) {
      sendMessage(ticket.id, content);
    }
  };

  // Gestione eventi di digitazione
  const handleTyping = () => {
    startTyping(ticket.id);
  };

  const handleStopTyping = () => {
    stopTyping(ticket.id);
  };

  if (!user) return null;

  return (
    <Card className="ticket-chat-card">
      <div className="ticket-chat-messages">
        {isLoading ? (
          <div className="ticket-chat-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="ticket-chat-error">
            {error}
          </div>
        ) : (
          <MessageList messages={messages} currentUser={user} />
        )}
      </div>
      
      <MessageInput
        ticketId={ticket.id}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!canSendMessages()}
        typingUsers={filteredTypingUsers}
      />
    </Card>
  );
};

export default TicketChat;