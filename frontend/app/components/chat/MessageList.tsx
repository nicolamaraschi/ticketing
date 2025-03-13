'use client';

import React, { useEffect, useRef } from 'react';
// Rimuovo gli import problematici
// import { formatDistanceToNow } from 'date-fns';
// import { it } from 'date-fns/locale';
import { Message, User } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Funzione alternativa per formattare la data
  const formatMessageDate = (date: string) => {
    const targetDate = new Date(date);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'poco fa';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minuto fa' : `${diffInMinutes} minuti fa`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 ora fa' : `${diffInHours} ore fa`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? 'ieri' : `${diffInDays} giorni fa`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 mese fa' : `${diffInMonths} mesi fa`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? '1 anno fa' : `${diffInYears} anni fa`;
  };

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Nessun messaggio ancora. Inizia la conversazione!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.user.id === currentUser.id;
          const isSupport = message.user.role === 'SUPPORT' || message.user.role === 'ADMIN';
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  flex max-w-md rounded-lg px-4 py-2
                  ${isCurrentUser 
                    ? 'bg-blue-600 text-white' 
                    : isSupport 
                      ? 'bg-gray-300 text-gray-900' 
                      : 'bg-gray-100 text-gray-900'
                  }
                `}
              >
                <div>
                  {!isCurrentUser && (
                    <div className="flex items-center mb-1">
                      <div 
                        className={`
                          h-6 w-6 rounded-full flex items-center justify-center mr-2
                          ${isSupport ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        `}
                      >
                        <span className="text-xs font-medium">
                          {getInitials(message.user.name)}
                        </span>
                      </div>
                      <span className="text-xs font-medium">{message.user.name}</span>
                    </div>
                  )}
                  
                  <div className="break-words">{message.content}</div>
                  
                  <div className="text-xs mt-1 text-right opacity-70">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;