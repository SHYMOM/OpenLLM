import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('openllm_auth_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('openllm_auth_token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('openllm_auth_token');
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (password: string) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setToken(password);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
