'use client';
import React from 'react';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, ApiError } from '../types/index';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Controlla se l'utente è già autenticato al caricamento
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Funzione per caricare dati utente
  const fetchUserData = async (authToken: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<User>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      setUser(response.data);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione di login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password }
      );
      
      const { token: authToken, user: userData } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      // Verifica semplicemente se l'errore ha la struttura di risposta
      if (error && error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Errore durante il login');
      }
      throw new Error('Errore durante il login');
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione di registrazione
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        { name, email, password, role: 'CLIENT' }
      );
      
      const { token: authToken, user: userData } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Verifica semplicemente se l'errore ha la struttura di risposta
      if (error && error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Errore durante la registrazione');
      }
      throw new Error('Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione di logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};