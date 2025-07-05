
import React, { createContext, useContext } from 'react';
import type { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { loginUser, registerUser, logoutUser } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthState();

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await loginUser(email, password);
      if (!success) {
        setIsLoading(false);
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      return await registerUser(name, email, password);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
