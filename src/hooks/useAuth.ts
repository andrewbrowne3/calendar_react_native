// Authentication hook - React's state management at its finest!
import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest } from '../types';
import apiService from '../services/api';
import storageService from '../services/storage';

// Custom hook for authentication - like a state manager but simpler!
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const isLoggedIn = await storageService.isLoggedIn();
      if (isLoggedIn) {
        const storedUser = await storageService.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('✅ User auto-logged in:', storedUser.email);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      await storageService.clearAll();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Logging in user:', credentials.email);
      
      const response = await apiService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful:', response.user.email);
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out user');
      
      await apiService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (!isAuthenticated) return;
      
      const updatedUser = await apiService.getCurrentUser();
      setUser(updatedUser);
      await storageService.saveUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [isAuthenticated]);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    refreshUser,
    checkAuthStatus,
  };
};