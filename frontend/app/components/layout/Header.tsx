'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'active-link' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-wrapper">
          <div className="header-logo">
            <Link href="/dashboard" className="logo-link">
              Sistema Ticket
            </Link>
          </div>
          
          <div className="desktop-menu">
            {user && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`nav-link ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/tickets" 
                  className={`nav-link ${isActive('/tickets')}`}
                >
                  Tickets
                </Link>
                {(user.role === 'ADMIN' || user.role === 'SUPPORT') && (
                  <Link 
                    href="/users" 
                    className={`nav-link ${isActive('/users')}`}
                  >
                    Utenti
                  </Link>
                )}
              </>
            )}
          </div>
          
          <div className="desktop-auth">
            {user ? (
              <div className="user-section">
                <span className="user-name">{user.name}</span>
                <button
                  onClick={logout}
                  className="logout-button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  href="/login"
                  className="login-button"
                >
                  Accedi
                </Link>
                <Link
                  href="/register"
                  className="register-button"
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>
          
          <div className="mobile-menu-button">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-toggle"
            >
              <span className="sr-only">Apri menu</span>
              <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`mobile-nav-link ${isActive('/dashboard')}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/tickets" 
                    className={`mobile-nav-link ${isActive('/tickets')}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tickets
                  </Link>
                  {(user.role === 'ADMIN' || user.role === 'SUPPORT') && (
                    <Link 
                      href="/users" 
                      className={`mobile-nav-link ${isActive('/users')}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Utenti
                    </Link>
                  )}
                </>
              )}
            </div>
            
            <div className="mobile-user-section">
              {user ? (
                <div className="mobile-user-info">
                  <div className="mobile-avatar">
                    <span className="avatar-text">{user.name.charAt(0)}</span>
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">{user.name}</div>
                    <div className="mobile-user-email">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-logout-button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link
                    href="/login"
                    className="mobile-login-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/register"
                    className="mobile-register-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrati
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;