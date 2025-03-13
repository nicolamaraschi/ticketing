// Tipologie di ruolo utente
export type UserRole = 'ADMIN' | 'SUPPORT' | 'CLIENT';

// Tipologie di stato ticket
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// Tipologie di priorità ticket
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Interfaccia utente
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

// Interfaccia ticket
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo?: User | null;
  _count?: {
    messages: number;
  };
  messages?: Message[];
}

// Interfaccia messaggio
export interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  ticketId: string;
}

// Interfaccia notifica utente che scrive
export interface TypingNotification {
  userId: string;
  name: string;
  isTyping: boolean;
}

// Interfaccia API error
export interface ApiError {
  message: string;
}

// Interfaccia per risposta login/register
export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}