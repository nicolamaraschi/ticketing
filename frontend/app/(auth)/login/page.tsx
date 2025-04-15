'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Colonna sinistra con background e branding */}
        <div className="col-md-6 d-none d-md-flex bg-primary align-items-center justify-content-center text-white p-5" style={{
          background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)'
        }}>
          <div className="text-center">
            <div className="mb-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.16C6.23 17.82 5.95 17.3 5.95 16.74C5.95 14.82 7.53 13.25 9.45 13.25H14.55C16.47 13.25 18.05 14.82 18.05 16.74C18.05 17.3 17.77 17.82 17.34 18.16C15.9 19.33 14.03 20 12 20Z" fill="#ffffff"/>
              </svg>
            </div>
            <h1 className="display-5 fw-bold mb-4">Sistema di Ticketing</h1>
            <p className="lead mb-5">Gestisci le tue richieste in modo efficiente e organizzato con la nostra piattaforma avanzata.</p>
            <div className="d-flex justify-content-center">
              <div className="badge bg-light text-primary p-3 rounded-pill">Assistenza 24/7 disponibile</div>
            </div>
          </div>
        </div>
        
        {/* Colonna destra con form di login */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-lg" style={{maxWidth: '450px', width: '100%', borderRadius: '16px'}}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h3 fw-bold mb-2">Benvenuto</h2>
                <p className="text-muted">Accedi al tuo account per continuare</p>
              </div>
              
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill me-2" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                  <div>{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      className={`form-control bg-light border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      placeholder="tuoemail@esempio.com"
                      autoComplete="email"
                      {...register('email', {
                        required: 'L\'email è obbligatoria',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Indirizzo email non valido'
                        }
                      })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label">Password</label>
                    <Link href="/forgot-password" className="text-decoration-none small">Password dimenticata?</Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control bg-light border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register('password', {
                        required: 'La password è obbligatoria',
                        minLength: {
                          value: 6,
                          message: 'La password deve essere di almeno 6 caratteri'
                        }
                      })}
                    />
                    <button 
                      className="input-group-text bg-light border-start-0" 
                      type="button"
                      onClick={togglePassword}
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      )}
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>
                </div>
                
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="remember-me" />
                  <label className="form-check-label" htmlFor="remember-me">
                    Ricordami
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Accesso in corso...
                    </>
                  ) : 'Accedi'}
                </button>
                
                <div className="text-center">
                  <p className="text-muted mb-3">Oppure accedi con</p>
                  <div className="d-flex justify-content-center gap-2 mb-4">
                    <button type="button" className="btn btn-outline-secondary px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                      </svg>
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="text-center pt-3 border-top">
                <p className="mb-0">
                  Non hai un account? <Link href="/register" className="text-decoration-none fw-semibold">Registrati</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}