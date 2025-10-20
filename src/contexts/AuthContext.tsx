import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(parseInt(storedUserId));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      setToken(response.token);
      setUserId(response.user_id);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user_id.toString());
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setToken(null);
    setUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
