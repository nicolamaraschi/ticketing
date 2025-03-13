import axios from 'axios';
import { Ticket, User, Message } from '../types/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crea un'istanza di axios con configurazione di base
const api = axios.create({
  baseURL: API_URL,
});

// Aggiungi token di autenticazione a ogni richiesta
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Gestione errori API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Ticket
export const ticketsApi = {
  getAll: async (status?: string): Promise<Ticket[]> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/tickets', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return []; // Restituisci un array vuoto in caso di errore
    }
  },
  
  getById: async (id: string): Promise<Ticket | null> => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      return null;
    }
  },
  
  create: async (data: { title: string; description: string; priority?: string }): Promise<Ticket | null> => {
    try {
      const response = await api.post('/tickets', data);
      return response.data || null;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<Ticket | null> => {
    try {
      const response = await api.patch(`/tickets/${id}/status`, { status });
      return response.data || null;
    } catch (error) {
      console.error(`Error updating ticket ${id} status:`, error);
      throw error;
    }
  },
  
  assign: async (id: string, assignedToId: string | null): Promise<Ticket | null> => {
    try {
      const response = await api.patch(`/tickets/${id}/assign`, { assignedToId });
      return response.data || null;
    } catch (error) {
      console.error(`Error assigning ticket ${id}:`, error);
      throw error;
    }
  }
};

// API Messaggi
export const messagesApi = {
  getByTicketId: async (ticketId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/messages/ticket/${ticketId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching messages for ticket ${ticketId}:`, error);
      return [];
    }
  },
  
  create: async (ticketId: string, content: string): Promise<Message | null> => {
    try {
      const response = await api.post(`/messages/ticket/${ticketId}`, { content });
      return response.data || null;
    } catch (error) {
      console.error(`Error creating message for ticket ${ticketId}:`, error);
      throw error;
    }
  }
};

// API Utenti
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  
  getSupportUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users/support');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching support users:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<User | null> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },
  
  create: async (userData: any): Promise<User | null> => {
    try {
      const response = await api.post('/users', userData);
      return response.data || null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  update: async (id: string, userData: any): Promise<User | null> => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data || null;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
};

export default api;