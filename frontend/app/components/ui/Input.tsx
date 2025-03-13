import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`input-container ${fullWidth ? 'input-full-width' : ''}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="input-label"
          >
            {label}
          </label>
        )}
        
        <div className="input-wrapper">
          {icon && (
            <div className="input-icon">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`input ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        </div>
        
        {error && (
          <p className="input-error-message">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;