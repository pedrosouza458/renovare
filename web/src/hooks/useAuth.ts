import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
      // Clear invalid token using the proper logout method
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadProfile();
    } else {
      setLoading(false); // No token found, stop loading
    }
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, cpf: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({ username, email, cpf, password });
      setUser(response.user);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      console.error('Registration error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated
  };
};