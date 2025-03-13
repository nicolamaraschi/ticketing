'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TicketCard from '../../components/tickets/TicketCard';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../lib/api';
import { Ticket, TicketStatus } from '../../types';
import './tickets.css';

export default function TicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketsApi.getAll(statusFilter || undefined);
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Impossibile caricare i ticket. Riprova più tardi.');
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    }
  }, [user, authLoading, router, statusFilter]);

  if (authLoading) {
    return (
      <div className="tickets-container">
        <div className="tickets-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TicketStatus | '');
  };

  return (
    <div className="tickets-container">
      <Header />
      
      <main className="tickets-main">
        <div className="tickets-content">
          <div className="tickets-header">
            <div>
              <h1 className="tickets-title">I Miei Ticket</h1>
              <p className="tickets-subtitle">Gestisci le tue richieste di supporto</p>
            </div>
            <div className="tickets-actions">
              <Link href="/tickets/new">
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Nuovo Ticket
                </Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader className="tickets-filter">
              <h2 className="filter-title">Tutti i Ticket</h2>
              
              <select
                className="status-filter"
                value={statusFilter}
                onChange={handleStatusChange}
                aria-label="Filtra per stato"
              >
                <option value="">Tutti gli stati</option>
                <option value="OPEN">Aperto</option>
                <option value="IN_PROGRESS">In Lavorazione</option>
                <option value="RESOLVED">Risolto</option>
                <option value="CLOSED">Chiuso</option>
              </select>
            </CardHeader>
            
            <CardBody>
              {isLoading ? (
                <div className="tickets-loading">
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <div className="tickets-error">
                  {error}
                </div>
              ) : tickets.length === 0 ? (
                <div className="tickets-empty">
                  <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="empty-text">Non hai ancora nessun ticket</p>
                  <Link href="/tickets/new">
                    <Button size="sm">Crea un ticket</Button>
                  </Link>
                </div>
              ) : (
                <div className="ticket-list">
                  {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}