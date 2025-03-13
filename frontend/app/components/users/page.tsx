'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../layout/Header';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api';
import { User } from '../../types';
import './users.css';

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Reindirizza se l'utente non è autenticato
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Reindirizza se l'utente non è admin o support
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPPORT') {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await usersApi.getAll();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Impossibile caricare gli utenti. Riprova più tardi.');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'ADMIN' || user.role === 'SUPPORT')) {
      fetchUsers();
    }
  }, [user, authLoading, router]);

  // Funzione per visualizzare il ruolo in italiano
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Amministratore';
      case 'SUPPORT':
        return 'Supporto';
      case 'CLIENT':
        return 'Cliente';
      default:
        return role;
    }
  };

  // Funzione per ottenere la variante del badge in base al ruolo
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SUPPORT':
        return 'warning';
      case 'CLIENT':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'ADMIN' && user.role !== 'SUPPORT') {
    return null;
  }

  return (
    <div className="users-container">
      <Header />
      
      <main className="users-main">
        <div className="users-content">
          <div className="users-header">
            <h1 className="users-title">Gestione Utenti</h1>
            <p className="users-subtitle">Visualizza e gestisci gli utenti del sistema</p>
          </div>
          
          <Card>
            <CardHeader className="card-header-with-action">
              <h2 className="card-title">Elenco utenti</h2>
              {user.role === 'ADMIN' && (
                <Button size="sm" variant="primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuovo Utente
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {error ? (
                <div className="error-container">
                  {error}
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="empty-text">Nessun utente trovato</p>
                </div>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Ruolo</th>
                        <th>Data Creazione</th>
                        {user.role === 'ADMIN' && <th>Azioni</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr) => (
                        <tr key={usr.id}>
                          <td className="user-name">{usr.name}</td>
                          <td className="user-email">{usr.email}</td>
                          <td>
                            <Badge variant={getRoleBadgeVariant(usr.role)}>
                              {getRoleLabel(usr.role)}
                            </Badge>
                          </td>
                          <td className="user-date">
                            {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                          </td>
                          {user.role === 'ADMIN' && (
                            <td className="user-actions">
                              <button className="action-button edit-button" title="Modifica">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="action-button delete-button" title="Elimina">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}