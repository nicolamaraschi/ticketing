'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { ticketsApi } from '../../lib/api';
import './TicketForm.css';

interface TicketFormData {
  title: string;
  description: string;
  priority: string;
}

const TicketForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<TicketFormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM'
    }
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await ticketsApi.create(data);
      
      router.push('/tickets');
      router.refresh();
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Si è verificato un errore durante la creazione del ticket. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="form-title">Nuovo Ticket</h2>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody>
          {error && (
            <div className="form-error-message">
              <div className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="error-text">{error}</div>
            </div>
          )}
          
          <div className="form-group">
            <Input
              id="title"
              label="Titolo"
              placeholder="Inserisci un titolo chiaro"
              fullWidth
              {...register('title', {
                required: 'Il titolo è obbligatorio',
                minLength: {
                  value: 5,
                  message: 'Il titolo deve essere di almeno 5 caratteri'
                }
              })}
              error={errors.title?.message}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descrizione
            </label>
            <textarea
              id="description"
              rows={5}
              className={`form-textarea ${errors.description ? 'form-textarea-error' : ''}`}
              placeholder="Descrivi dettagliatamente il problema"
              {...register('description', {
                required: 'La descrizione è obbligatoria',
                minLength: {
                  value: 10,
                  message: 'La descrizione deve essere di almeno 10 caratteri'
                }
              })}
            />
            {errors.description && (
              <p className="input-error-message">{errors.description.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priorità
            </label>
            <select
              id="priority"
              className="form-select"
              {...register('priority')}
            >
              <option value="LOW">Bassa</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
        </CardBody>
        
        <CardFooter className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Crea Ticket
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketForm;