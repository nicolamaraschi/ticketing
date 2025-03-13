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
import { Ticket } from '../../types';
import './dashboard.css'; // Importa il CSS personalizzato

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchRecentTickets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ticketsApi.getAll();
        // Assicurati che data sia un array prima di chiamare slice
        if (Array.isArray(data)) {
          setTickets(data.slice(0, 5)); // Prendi solo i primi 5 ticket
        } else {
          console.error("Data is not an array:", data);
          setTickets([]);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Impossibile caricare i ticket recenti. Riprova più tardi.');
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRecentTickets();
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Benvenuto nel sistema di ticketing, {user.name}!</p>
          </div>
          
          <div className="dashboard-grid">
            {/* Riepilogo */}
            <Card>
              <CardHeader>
                <h2 className="card-title">Cosa puoi fare</h2>
              </CardHeader>
              <CardBody>
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">Crea un nuovo ticket</h3>
                      <p className="feature-description">
                        Hai bisogno di assistenza? Crea un nuovo ticket e il nostro team ti risponderà al più presto.
                      </p>
                      <div className="feature-action">
                        <Link href="/tickets/new">
                          <Button size="sm">Nuovo Ticket</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">Gestisci i tuoi ticket</h3>
                      <p className="feature-description">
                        Visualizza e gestisci tutti i tuoi ticket di supporto in un unico posto.
                      </p>
                      <div className="feature-action">
                        <Link href="/tickets">
                          <Button size="sm" variant="outline">Visualizza Ticket</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {(user.role === 'ADMIN' || user.role === 'SUPPORT') && (
                    <div className="feature-item">
                      <div className="feature-icon">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="feature-content">
                        <h3 className="feature-title">Gestisci gli utenti</h3>
                        <p className="feature-description">
                          Visualizza e gestisci gli utenti del sistema di ticketing.
                        </p>
                        <div className="feature-action">
                          <Link href="/users">
                            <Button size="sm" variant="outline">Visualizza Utenti</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
            
            {/* Ticket recenti */}
            <Card>
              <CardHeader className="card-header-with-action">
                <h2 className="card-title">Ticket recenti</h2>
                <Link href="/tickets">
                  <span className="view-all-link">
                    Vedi tutti
                  </span>
                </Link>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="loading-container-small">
                    <div className="loading-spinner-small"></div>
                  </div>
                ) : error ? (
                  <div className="error-container">
                    {error}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="empty-state">
                    <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="empty-text">Non ci sono ticket recenti</p>
                    <div className="empty-action">
                      <Link href="/tickets/new">
                        <Button size="sm">Crea un ticket</Button>
                      </Link>
                    </div>
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
        </div>
      </main>
    </div>
  );
}