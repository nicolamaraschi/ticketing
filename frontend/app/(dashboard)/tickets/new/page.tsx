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
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-light min-vh-100">
      <Header />
      
      <main className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard" className="text-decoration-none">Dashboard</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/tickets" className="text-decoration-none">Ticket</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Nuovo Ticket</li>
          </ol>
        </nav>
        
        <div className="mb-4">
          <h1 className="h3 mb-2">Nuovo Ticket</h1>
          <p className="text-muted">Crea un nuovo ticket di supporto</p>
        </div>
        
        <div className="row">
          <div className="col-lg-8">
            <TicketForm />
          </div>
          
          <div className="col-lg-4 mt-4 mt-lg-0">
            {/* Card con suggerimenti */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">Suggerimenti</h5>
              </div>
              <div className="card-body">
                <h6 className="fw-bold">Consigli per un buon ticket:</h6>
                <ul className="mb-3">
                  <li>Sii specifico e conciso nel titolo</li>
                  <li>Includi tutti i passaggi per riprodurre il problema</li>
                  <li>Menziona eventuali messaggi di errore</li>
                  <li>Indica quando è iniziato il problema</li>
                  <li>Specifica quale browser/dispositivo stai utilizzando</li>
                </ul>
                
                <div className="alert alert-info d-flex" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-info-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                  <div>
                    Un ticket ben documentato ci aiuta a risolvere il tuo problema più velocemente.
                  </div>
                </div>
              </div>
            </div>
            
            {/* FAQ */}
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="card-title mb-0">Domande frequenti</h5>
              </div>
              <div className="card-body">
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        Quanto tempo ci vuole per una risposta?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        Generalmente rispondiamo entro 24 ore lavorative, ma i ticket con priorità alta o urgente vengono gestiti più rapidamente.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                        Posso modificare un ticket dopo averlo inviato?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                      <div className="accordion-body">
                        Non è possibile modificare un ticket dopo l'invio, ma puoi aggiungere ulteriori informazioni rispondendo al ticket.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}