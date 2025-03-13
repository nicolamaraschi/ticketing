'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Si è verificato un errore durante il login. Riprova più tardi.');
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Sistema di Ticketing</h1>
          <h2 className="auth-subtitle">Accedi al tuo account</h2>
        </div>
        
        <form className="form-container space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="error-alert">
              <div className="error-icon">
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="error-message">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                fullWidth
                label="Email"
                placeholder="tuoemail@esempio.com"
                {...register('email', {
                  required: 'L\'email è obbligatoria',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Indirizzo email non valido'
                  }
                })}
                error={errors.email?.message}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                }
              />
            </div>
            
            <div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
                label="Password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'La password è obbligatoria',
                  minLength: {
                    value: 6,
                    message: 'La password deve essere di almeno 6 caratteri'
                  }
                })}
                error={errors.password?.message}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Accedi
            </Button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Non hai un account?{' '}
            <Link href="/register">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}