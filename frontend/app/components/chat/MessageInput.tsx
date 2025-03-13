'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { TypingNotification } from '../../types';
import './MessageInput.css';

interface MessageInputProps {
  ticketId: string;
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  typingUsers?: TypingNotification[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  ticketId,
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  typingUsers = []
}) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Gestione input per la digitazione
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Trigger typing event
    if (value && !typingTimeout) {
      onTyping();
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        onStopTyping();
        setTypingTimeout(null);
      }, 3000);
      
      setTypingTimeout(timeout);
    }
    
    // If emptied, stop typing immediately
    if (!value && typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
      onStopTyping();
    }
  };

  // Gestione invio messaggio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset typing status
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      onStopTyping();
    }
  };

  // Gestione tasto invio
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Pulizia timeout al unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      onStopTyping();
    };
  }, [onStopTyping, typingTimeout]);

  return (
    <div className="message-input-container">
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0].name} sta scrivendo...</span>
          ) : (
            <span>Più persone stanno scrivendo...</span>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-form">
        <div className="message-textarea-container">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={2}
            className={`message-textarea ${disabled ? 'message-textarea-disabled' : ''}`}
            placeholder={disabled ? "Non puoi inviare messaggi in questo ticket" : "Scrivi un messaggio..."}
          />
        </div>
        
        <div className="message-submit-container">
          <Button
            type="submit"
            disabled={disabled || !message.trim()}
          >
            Invia
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;