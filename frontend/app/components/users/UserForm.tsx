'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import './UserForm.css';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  isEditing?: boolean;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  user,
  isEditing = false,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      role: user?.role || 'CLIENT'
    }
  });

  const password = watch('password');

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Si è verificato un errore. Riprova più tardi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="user-form-card">
      <CardHeader>
        <h2 className="card-title">{isEditing ? 'Modifica Utente' : 'Nuovo Utente'}</h2>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardBody>
          {error && (
            <div className="error-alert">
              <div className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="error-message">{error}</div>
            </div>
          )}

          <div className="form-group">
            <Input
              id="name"
              type="text"
              label="Nome completo"
              placeholder="Mario Rossi"
              fullWidth
              {...register('name', {
                required: 'Il nome è obbligatorio',
                minLength: {
                  value: 2,
                  message: 'Il nome deve essere di almeno 2 caratteri'
                }
              })}
              error={errors.name?.message}
            />
          </div>

          <div className="form-group">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="esempio@domain.com"
              fullWidth
              {...register('email', {
                required: 'L\'email è obbligatoria',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email non valida'
                }
              })}
              error={errors.email?.message}
            />
          </div>

          <div className="form-group">
            <Input
              id="password"
              type="password"
              label={isEditing ? 'Nuova password (lascia vuoto per non modificare)' : 'Password'}
              placeholder="••••••••"
              fullWidth
              {...register('password', {
                ...(isEditing ? {} : { required: 'La password è obbligatoria' }),
                minLength: {
                  value: 6,
                  message: 'La password deve essere di almeno 6 caratteri'
                }
              })}
              error={errors.password?.message}
            />
          </div>

          <div className="form-group">
            <Input
              id="confirmPassword"
              type="password"
              label="Conferma password"
              placeholder="••••••••"
              fullWidth
              {...register('confirmPassword', {
                ...(isEditing && !password ? {} : { required: 'La conferma password è obbligatoria' }),
                validate: value => !password || value === password || 'Le password non coincidono'
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">Ruolo</label>
            <select
              id="role"
              className="form-select"
              {...register('role', { required: 'Il ruolo è obbligatorio' })}
            >
              <option value="CLIENT">Cliente</option>
              <option value="SUPPORT">Supporto</option>
              <option value="ADMIN">Amministratore</option>
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
        </CardBody>

        <CardFooter className="user-form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Aggiorna' : 'Crea'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserForm;