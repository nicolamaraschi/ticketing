'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserForm from '../../components/users/UserForm';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api';
import { User } from '../../types';
import './users.css';

type FormMode = 'none' | 'create' | 'edit';

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const router = useRouter();

  // Carica la lista degli utenti
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

  // Controlla l'autenticazione e carica gli utenti
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

    if (user && (user.role === 'ADMIN' || user.role === 'SUPPORT')) {
      fetchUsers();
    }
  }, [user, authLoading, router]);

  // Gestione creazione nuovo utente
  const handleCreateUser = async (formData: any) => {
    try {
      // Rimuovi confirmPassword dal payload
      const { confirmPassword, ...userData } = formData;
      
      await usersApi.create(userData);
      setFormMode('none');
      // Ricarica la lista degli utenti
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  // Gestione modifica utente
  const handleUpdateUser = async (formData: any) => {
    if (!selectedUser) return;
    
    try {
      // Rimuovi confirmPassword dal payload
      const { confirmPassword, ...userData } = formData;
      
      // Se la password è vuota, rimuovila dal payload
      if (!userData.password) {
        delete userData.password;
      }
      
      await usersApi.update(selectedUser.id, userData);
      setFormMode('none');
      setSelectedUser(null);
      // Ricarica la lista degli utenti
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  // Gestione eliminazione utente
  const handleDeleteUser = async (userId: string) => {
    try {
      await usersApi.delete(userId);
      setDeleteConfirmation(null);
      // Ricarica la lista degli utenti
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Impossibile eliminare l\'utente. Riprova più tardi.');
    }
  };

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
        return 'badge-danger';
      case 'SUPPORT':
        return 'badge-warning';
      case 'CLIENT':
        return 'badge-primary';
      default:
        return 'badge-default';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'ADMIN' && user.role !== 'SUPPORT') {
    return null;
  }

  // Mostra il form di creazione/modifica se necessario
  if (formMode === 'create') {
    return (
      <div className="users-container">
        <Header />
        <main className="users-main">
          <div className="users-content">
            <UserForm 
              onSubmit={handleCreateUser} 
              onCancel={() => setFormMode('none')}
            />
          </div>
        </main>
      </div>
    );
  }

  if (formMode === 'edit' && selectedUser) {
    return (
      <div className="users-container">
        <Header />
        <main className="users-main">
          <div className="users-content">
            <UserForm 
              user={selectedUser}
              isEditing
              onSubmit={handleUpdateUser} 
              onCancel={() => {
                setFormMode('none');
                setSelectedUser(null);
              }}
            />
          </div>
        </main>
      </div>
    );
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
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => setFormMode('create')}
                >
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
                  {deleteConfirmation && (
                    <div className="delete-confirmation">
                      <p>Sei sicuro di voler eliminare questo utente?</p>
                      <div className="confirmation-actions">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeleteConfirmation(null)}
                        >
                          Annulla
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleDeleteUser(deleteConfirmation)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  )}
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
                            <span className={`role-badge ${getRoleBadgeVariant(usr.role)}`}>
                              {getRoleLabel(usr.role)}
                            </span>
                          </td>
                          <td className="user-date">
                            {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                          </td>
                          {user.role === 'ADMIN' && (
                            <td className="user-actions">
                              <button 
                                className="action-button edit-button" 
                                title="Modifica"
                                onClick={() => {
                                  setSelectedUser(usr);
                                  setFormMode('edit');
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="action-button delete-button" 
                                title="Elimina"
                                onClick={() => setDeleteConfirmation(usr.id)}
                                disabled={usr.id === user.id} // Non permettere di eliminare se stesso
                              >
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