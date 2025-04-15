'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import TicketCard from '../../components/tickets/TicketCard';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../lib/api';
import { Ticket, TicketStatus } from '../../types';

export default function TicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const router = useRouter();

  // Statistiche dei ticket
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketsApi.getAll();
        
        if (Array.isArray(data)) {
          setTickets(data);
          
          // Calcola le statistiche
          const newStats = {
            total: data.length,
            open: data.filter(t => t.status === 'OPEN').length,
            inProgress: data.filter(t => t.status === 'IN_PROGRESS').length,
            resolved: data.filter(t => t.status === 'RESOLVED').length,
            closed: data.filter(t => t.status === 'CLOSED').length
          };
          setStats(newStats);
        } else {
          setTickets([]);
        }
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
  }, [user, authLoading, router]);

  // Filtra e ordina i ticket quando cambiano i filtri
  useEffect(() => {
    let result = [...tickets];
    
    // Applica filtro per stato
    if (statusFilter) {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    // Applica ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(query) || 
        ticket.description.toLowerCase().includes(query)
      );
    }
    
    // Applica ordinamento
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else if (sortOrder === 'priority') {
      const priorityOrder: Record<string, number> = {
        'URGENT': 0,
        'HIGH': 1,
        'MEDIUM': 2,
        'LOW': 3
      };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    
    setFilteredTickets(result);
  }, [tickets, statusFilter, searchQuery, sortOrder]);

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Helper per ottenere la classe del bottone di filtro
  const getFilterButtonClass = (status: string) => {
    return `btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-primary'}`;
  };

  return (
    <div className="bg-light min-vh-100">
      <Header />
      
      <div className="container py-4">
        {/* Header con titolo e pulsante Nuovo Ticket */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">I Miei Ticket</h1>
            <p className="text-muted">Gestisci le tue richieste di supporto</p>
          </div>
          <Link href="/tickets/new">
            <button className="btn btn-primary d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
              </svg>
              Nuovo Ticket
            </button>
          </Link>
        </div>
        
        {/* Card con statistiche */}
        <div className="row g-3 mb-4">
          <div className="col-md col-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="text-primary mb-0">{stats.total}</h5>
                <p className="text-muted small mb-0">Totale</p>
              </div>
            </div>
          </div>
          <div className="col-md col-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="text-info mb-0">{stats.open}</h5>
                <p className="text-muted small mb-0">Aperti</p>
              </div>
            </div>
          </div>
          <div className="col-md col-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="text-warning mb-0">{stats.inProgress}</h5>
                <p className="text-muted small mb-0">In Lavorazione</p>
              </div>
            </div>
          </div>
          <div className="col-md col-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="text-success mb-0">{stats.resolved}</h5>
                <p className="text-muted small mb-0">Risolti</p>
              </div>
            </div>
          </div>
          <div className="col-md col-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <h5 className="text-secondary mb-0">{stats.closed}</h5>
                <p className="text-muted small mb-0">Chiusi</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtri e ricerca */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              {/* Filtri per stato */}
              <div className="col-lg-6">
                <div className="btn-group w-100" role="group" aria-label="Filtri per stato">
                  <button 
                    type="button" 
                    className={getFilterButtonClass('')}
                    onClick={() => setStatusFilter('')}
                  >
                    Tutti
                  </button>
                  <button 
                    type="button" 
                    className={getFilterButtonClass('OPEN')}
                    onClick={() => setStatusFilter('OPEN')}
                  >
                    Aperti
                  </button>
                  <button 
                    type="button" 
                    className={getFilterButtonClass('IN_PROGRESS')}
                    onClick={() => setStatusFilter('IN_PROGRESS')}
                  >
                    In Lavorazione
                  </button>
                  <button 
                    type="button" 
                    className={getFilterButtonClass('RESOLVED')}
                    onClick={() => setStatusFilter('RESOLVED')}
                  >
                    Risolti
                  </button>
                  <button 
                    type="button" 
                    className={getFilterButtonClass('CLOSED')}
                    onClick={() => setStatusFilter('CLOSED')}
                  >
                    Chiusi
                  </button>
                </div>
              </div>
              
              {/* Barra di ricerca */}
              <div className="col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Cerca nei ticket..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Ordinamento */}
              <div className="col-lg-2">
                <select 
                  className="form-select" 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'priority')}
                >
                  <option value="newest">Più recenti</option>
                  <option value="oldest">Più vecchi</option>
                  <option value="priority">Per priorità</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista ticket */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
                <p className="mt-3 text-muted">Caricamento dei ticket in corso...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-exclamation-circle text-danger mb-3" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                <h5 className="text-danger">Si è verificato un errore</h5>
                <p className="text-muted">{error}</p>
                <button 
                  className="btn btn-outline-primary mt-2"
                  onClick={() => window.location.reload()}
                >
                  Riprova
                </button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-ticket-perforated text-muted mb-3" viewBox="0 0 16 16">
                  <path d="M4 4.85v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Zm-7 1.8v.9h1v-.9H4Zm7 0v.9h1v-.9h-1Z"/>
                  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3h-13ZM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9V4.5Z"/>
                </svg>
                <h5>Nessun ticket trovato</h5>
                <p className="text-muted mb-4">{searchQuery || statusFilter 
                  ? 'Nessun ticket corrisponde ai filtri impostati.' 
                  : 'Non hai ancora creato alcun ticket di supporto.'}</p>
                
                {searchQuery || statusFilter ? (
                  <button 
                    className="btn btn-outline-secondary me-2"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                    }}
                  >
                    Cancella filtri
                  </button>
                ) : null}
                
                <Link href="/tickets/new">
                  <button className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                      <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/>
                    </svg>
                    Crea un ticket
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {/* Intestazione risultati */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="text-muted mb-0">
                    Visualizzazione di <strong>{filteredTickets.length}</strong> ticket{filteredTickets.length !== tickets.length ? ` (filtrati da ${tickets.length})` : ''}
                  </p>
                </div>
                
                {/* Lista ticket */}
                <div className="d-flex flex-column gap-3">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="card hover-shadow border">
                      <div className="card-body p-0">
                        <Link 
                          href={`/tickets/${ticket.id}`} 
                          className="text-decoration-none text-reset"
                        >
                          <div className="d-flex justify-content-between p-3">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                {/* Stato ticket */}
                                <span className={`badge ${
                                  ticket.status === 'OPEN' ? 'bg-info' : 
                                  ticket.status === 'IN_PROGRESS' ? 'bg-warning' : 
                                  ticket.status === 'RESOLVED' ? 'bg-success' : 
                                  'bg-secondary'
                                } me-2`}>
                                  {ticket.status === 'OPEN' ? 'Aperto' : 
                                   ticket.status === 'IN_PROGRESS' ? 'In Lavorazione' : 
                                   ticket.status === 'RESOLVED' ? 'Risolto' : 
                                   'Chiuso'}
                                </span>
                                
                                {/* Priorità ticket */}
                                <span className={`badge ${
                                  ticket.priority === 'URGENT' ? 'bg-danger' : 
                                  ticket.priority === 'HIGH' ? 'bg-warning text-dark' : 
                                  ticket.priority === 'MEDIUM' ? 'bg-primary' : 
                                  'bg-light text-dark'
                                } me-2`}>
                                  {ticket.priority === 'URGENT' ? 'Urgente' : 
                                   ticket.priority === 'HIGH' ? 'Alta' :
                                   ticket.priority === 'MEDIUM' ? 'Media' : 
                                   'Bassa'}
                                </span>
                                
                                {/* ID ticket */}
                                <small className="text-muted">ID: {ticket.id.substring(0, 8)}...</small>
                              </div>
                              
                              {/* Titolo ticket */}
                              <h5 className="card-title mb-1">{ticket.title}</h5>
                              
                              {/* Descrizione ticket (troncata) */}
                              <p className="card-text text-muted mb-2" style={{
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {ticket.description}
                              </p>
                              
                              {/* Info aggiuntive */}
                              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                                <div className="d-flex align-items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-calendar3 me-1" viewBox="0 0 16 16">
                                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
                                    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                  </svg>
                                  {new Date(ticket.updatedAt).toLocaleDateString('it-IT')}
                                </div>
                                
                                {ticket._count && (
                                  <div className="d-flex align-items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-chat-dots me-1" viewBox="0 0 16 16">
                                      <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                      <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                                    </svg>
                                    {ticket._count.messages} messaggi
                                  </div>
                                )}
                                
                                {ticket.assignedTo && (
                                  <div className="d-flex align-items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-person me-1" viewBox="0 0 16 16">
                                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                    </svg>
                                    Assegnato a: {ticket.assignedTo.name}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="d-flex align-items-center ms-3">
                              <button className="btn btn-sm btn-outline-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Paginazione (se necessaria) */}
        {filteredTickets.length > 10 && (
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Paginazione ticket">
              <ul className="pagination">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex={-1} aria-disabled="true">Precedente</a>
                </li>
                <li className="page-item active" aria-current="page">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">Successiva</a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}