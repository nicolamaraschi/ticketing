'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import TicketStatusBadge from './TicketStatusBadge';
import PriorityBadge from './PriorityBadge';
import { Ticket } from '../../types';
import './TicketCard.css';

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formattedDate = formatDistanceToNow(new Date(ticket.updatedAt), {
    addSuffix: true,
    locale: it
  });

  return (
    <Link href={`/tickets/${ticket.id}`} className="ticket-card-link">
      <div className="ticket-card">
        <div className="ticket-card-header">
          <h3 className="ticket-card-title">{ticket.title}</h3>
          <div className="ticket-card-badges">
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
        
        <div className="ticket-card-body">
          <p className="ticket-card-description">{ticket.description}</p>
        </div>
        
        <div className="ticket-card-footer">
          <div className="ticket-card-created-by">
            <div className="user-avatar">
              <span>{ticket.createdBy.name.charAt(0)}</span>
            </div>
            <span className="created-by-name">{ticket.createdBy.name}</span>
          </div>
          
          <div className="ticket-card-meta">
            {ticket._count && (
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{ticket._count.messages}</span>
              </div>
            )}
            
            <div className="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        
        {ticket.assignedTo && (
          <div className="ticket-card-assigned">
            <span className="assigned-label">Assegnato a:</span>
            <span className="assigned-name">{ticket.assignedTo.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TicketCard;