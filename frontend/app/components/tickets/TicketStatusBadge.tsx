import React from 'react';
import { TicketStatus } from '../../types';
import './TicketStatusBadge.css';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  const getStatusClassName = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'badge-primary';
      case 'IN_PROGRESS':
        return 'badge-warning';
      case 'RESOLVED':
        return 'badge-success';
      case 'CLOSED':
        return 'badge-secondary';
      default:
        return 'badge-default';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'Aperto';
      case 'IN_PROGRESS':
        return 'In Lavorazione';
      case 'RESOLVED':
        return 'Risolto';
      case 'CLOSED':
        return 'Chiuso';
      default:
        return status;
    }
  };

  return (
    <span className={`status-badge ${getStatusClassName(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default TicketStatusBadge;