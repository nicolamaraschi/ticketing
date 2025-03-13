import React from 'react';
import { Priority } from '../../types';
import './PriorityBadge.css';

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityClassName = (priority: Priority) => {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      case 'URGENT':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'LOW':
        return 'Bassa';
      case 'MEDIUM':
        return 'Media';
      case 'HIGH':
        return 'Alta';
      case 'URGENT':
        return 'Urgente';
      default:
        return priority;
    }
  };

  return (
    <span className={`priority-badge ${getPriorityClassName(priority)}`}>
      {getPriorityLabel(priority)}
    </span>
  );
};

export default PriorityBadge;