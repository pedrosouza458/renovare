import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const { login, register, loading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    cpf: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // CPF validation function
  const validateCPF = (cpf: string): boolean => {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Check if CPF has 11 digits
    if (cleanCPF.length !== 11) return false;
    
    // Check for known invalid CPFs (all same digits)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validate CPF using the algorithm
    let sum = 0;
    let remainder;
    
    // Validate first digit
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
    
    // Validate second digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
    
    return true;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'register') {
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.cpf) {
        errors.cpf = 'CPF is required';
      } else if (!validateCPF(formData.cpf)) {
        errors.cpf = 'Please enter a valid CPF';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      let success = false;
      
      if (mode === 'login') {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.username, formData.email, formData.cpf, formData.password);
      }
      
      if (success) {
        onClose();
        setFormData({ email: '', password: '', username: '', cpf: '', confirmPassword: '' });
        setValidationErrors({});
      }
    } catch (err) {
      // Error handling is done in the hook
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format CPF as user types
    if (field === 'cpf') {
      // Remove all non-numeric characters
      value = value.replace(/\D/g, '');
      
      // Apply CPF formatting: 000.000.000-00
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
        value = value.replace(/(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3');
        value = value.replace(/(\d{3})(\d{1})$/, '$1.$2');
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setValidationErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button className="auth-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="auth-modal-content">
          <div className="auth-welcome">
            <div className="auth-icon">
              🌊
            </div>
            <p>
              {mode === 'login' 
                ? 'Sign in to save your waterway discoveries and track your environmental contributions!'
                : 'Join our community and start making a difference in waterway monitoring!'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  className={validationErrors.username ? 'error' : ''}
                  placeholder="Enter your username"
                  disabled={loading}
                />
                {validationErrors.username && (
                  <span className="field-error">{validationErrors.username}</span>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleInputChange('cpf')}
                  className={validationErrors.cpf ? 'error' : ''}
                  placeholder="Enter your CPF (000.000.000-00)"
                  maxLength={14}
                  disabled={loading}
                />
                {validationErrors.cpf && (
                  <span className="field-error">{validationErrors.cpf}</span>
                )}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={validationErrors.email ? 'error' : ''}
                placeholder="Enter your email"
                disabled={loading}
              />
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className={validationErrors.password ? 'error' : ''}
                placeholder="Enter your password"
                disabled={loading}
              />
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={validationErrors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {validationErrors.confirmPassword && (
                  <span className="field-error">{validationErrors.confirmPassword}</span>
                )}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button 
              type="button" 
              className="auth-switch-button"
              onClick={switchMode}
              disabled={loading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};