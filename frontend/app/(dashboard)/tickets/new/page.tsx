'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import TicketForm from '../../../components/tickets/TicketForm';
import { useAuth } from '../../../context/AuthContext';
import './new-ticket.css';

export default function NewTicketPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="new-ticket-container">
      <Header />
      
      <main className="new-ticket-main">
        <div className="new-ticket-content">
          <div className="new-ticket-header">
            <h1 className="new-ticket-title">Nuovo Ticket</h1>
            <p className="new-ticket-subtitle">Crea un nuovo ticket di supporto</p>
          </div>
          
          <TicketForm />
        </div>
      </main>
    </div>
  );
}