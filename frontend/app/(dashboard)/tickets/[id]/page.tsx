'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import Header from '../../../components/layout/Header';
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TicketStatusBadge from '../../../components/tickets/TicketStatusBadge';
import PriorityBadge from '../../../components/tickets/PriorityBadge';
import TicketChat from '../../../components/chat/TicketChat';
import { useAuth } from '../../../context/AuthContext';
import { ticketsApi, usersApi } from '../../../lib/api';
import { Ticket, User } from '../../../types';
import './ticket-detail.css';

export default function TicketDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [supportUsers, setSupportUsers] = useState<User[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  // Verifica se l'utente è un operatore
  const isOperator = user?.role === 'SUPPORT' || user?.role === 'ADMIN';

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: it
    });
  };

  // Carica i dati del ticket
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketsApi.getById(ticketId);
        if (data) {
          setTicket(data);
          
          // Imposta l'operatore selezionato
          if (data.assignedTo) {
            setSelectedOperator(data.assignedTo.id);
          }
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Impossibile caricare il ticket. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    };

    // Carica gli operatori disponibili (solo per operatori)
    const fetchSupportUsers = async () => {
      if (isOperator) {
        try {
          const data = await usersApi.getSupportUsers();
          setSupportUsers(data || []);
        } catch (err) {
          console.error('Error fetching support users:', err);
        }
      }
    };

    if (user) {
      fetchTicket();
      fetchSupportUsers();
    }
  }, [user, authLoading, router, ticketId, isOperator]);

  // Aggiorna lo stato del ticket
  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || !isOperator) return;
    
    try {
      setIsActionLoading(true);
      const updatedTicket = await ticketsApi.updateStatus(ticketId, newStatus);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Impossibile aggiornare lo stato del ticket. Riprova più tardi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Assegna il ticket a un operatore
  const handleAssignTicket = async () => {
    if (!ticket || !isOperator) return;
    
    try {
      setIsActionLoading(true);
      const updatedTicket = await ticketsApi.assign(ticketId, selectedOperator || null);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError('Impossibile assegnare il ticket. Riprova più tardi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="ticket-detail-loading-page">
        <Header />
        <main className="ticket-detail-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="ticket-detail-container">
        <Header />
        <main className="ticket-detail-main">
          <div className="ticket-detail-content">
            <Card>
              <CardBody>
                <div className="ticket-error">
                  <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="error-title">Errore</h2>
                  <p className="error-message">{error || 'Impossibile visualizzare il ticket richiesto.'}</p>
                  <div className="error-action">
                    <Button onClick={() => router.push('/tickets')}>
                      Torna ai Ticket
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="ticket-detail-container">
      <Header />
      
      <main className="ticket-detail-main">
        <div className="ticket-detail-content">
          <div className="ticket-detail-header">
            <div className="ticket-header-info">
              <h1 className="ticket-detail-title">Ticket #{ticket.id.substring(0, 8)}</h1>
              <p className="ticket-detail-date">Creato {formatDate(ticket.createdAt)}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => router.push('/tickets')}
            >
              Torna ai Ticket
            </Button>
          </div>
          
          <div className="ticket-detail-grid">
            {/* Dettagli ticket */}
            <div className="ticket-sidebar">
              <Card>
                <CardHeader>
                  <h2 className="ticket-section-title">Dettagli</h2>
                </CardHeader>
                <CardBody className="ticket-details-content">
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Stato</h3>
                    <div className="detail-value">
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                  </div>
                  
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Priorità</h3>
                    <div className="detail-value">
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                  
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Cliente</h3>
                    <div className="detail-value user-detail">
                      <div className="user-avatar">
                        <span>{ticket.createdBy.name.charAt(0)}</span>
                      </div>
                      <div className="user-info">
                        <p className="user-name">{ticket.createdBy.name}</p>
                        <p className="user-email">{ticket.createdBy.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Assegnato a</h3>
                    <div className="detail-value">
                      {ticket.assignedTo ? (
                        <div className="user-detail">
                          <div className="user-avatar support-avatar">
                            <span>{ticket.assignedTo.name.charAt(0)}</span>
                          </div>
                          <div className="user-info">
                            <p className="user-name">{ticket.assignedTo.name}</p>
                            <p className="user-email">{ticket.assignedTo.email}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="empty-value">Non assegnato</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Creato il</h3>
                    <p className="detail-value">
                      {new Date(ticket.createdAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                  
                  <div className="ticket-detail-item">
                    <h3 className="detail-label">Ultimo aggiornamento</h3>
                    <p className="detail-value">
                      {new Date(ticket.updatedAt).toLocaleString('it-IT')}
                    </p>
                  </div>
                </CardBody>
                
                {isOperator && (
                  <CardFooter className="ticket-actions-container">
                    {/* Cambia stato */}
                    <div className="ticket-action-section">
                      <h3 className="action-title">Cambia stato</h3>
                      <div className="status-buttons">
                        <Button
                          size="sm"
                          variant={ticket.status === 'OPEN' ? 'primary' : 'outline'}
                          onClick={() => handleStatusChange('OPEN')}
                          disabled={isActionLoading || ticket.status === 'OPEN'}
                          className="status-button"
                        >
                          Aperto
                        </Button>
                        <Button
                          size="sm"
                          variant={ticket.status === 'IN_PROGRESS' ? 'primary' : 'outline'}
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          disabled={isActionLoading || ticket.status === 'IN_PROGRESS'}
                          className="status-button"
                        >
                          In Lavorazione
                        </Button>
                        <Button
                          size="sm"
                          variant={ticket.status === 'RESOLVED' ? 'primary' : 'outline'}
                          onClick={() => handleStatusChange('RESOLVED')}
                          disabled={isActionLoading || ticket.status === 'RESOLVED'}
                          className="status-button"
                        >
                          Risolto
                        </Button>
                        <Button
                          size="sm"
                          variant={ticket.status === 'CLOSED' ? 'primary' : 'outline'}
                          onClick={() => handleStatusChange('CLOSED')}
                          disabled={isActionLoading || ticket.status === 'CLOSED'}
                          className="status-button"
                        >
                          Chiuso
                        </Button>
                      </div>
                    </div>
                    
                    {/* Assegna ticket */}
                    <div className="ticket-action-section">
                      <h3 className="action-title">Assegna ticket</h3>
                      <div className="assign-container">
                        <select
                          className="assign-select"
                          value={selectedOperator}
                          onChange={(e) => setSelectedOperator(e.target.value)}
                          disabled={isActionLoading}
                        >
                          <option value="">Non assegnato</option>
                          {supportUsers.map((supportUser) => (
                            <option key={supportUser.id} value={supportUser.id}>
                              {supportUser.name} ({supportUser.role})
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={handleAssignTicket}
                          disabled={isActionLoading || (ticket.assignedTo?.id === selectedOperator)}
                        >
                          Assegna
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
            
            {/* Contenuto ticket e chat */}
            <div className="ticket-content">
              <Card className="ticket-description-card">
                <CardHeader>
                  <h2 className="ticket-title">{ticket.title}</h2>
                </CardHeader>
                <CardBody>
                  <p className="ticket-description">{ticket.description}</p>
                </CardBody>
              </Card>
              
              <div className="ticket-chat-section">
                <h2 className="chat-section-title">Conversazione</h2>
                <TicketChat ticket={ticket} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}