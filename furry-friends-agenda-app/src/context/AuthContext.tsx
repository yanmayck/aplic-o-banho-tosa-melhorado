import React, { createContext, useContext, useState, useEffect } from 'react';
import { post, get } from './utils/api-client';
import { jwtDecode } from 'jwt-decode';
import { toast } from '@/components/ui/use-toast';

// Define the user types
export type UserRole = 'USER' | 'ADMIN' | 'HANDLER';

// Define the user interface
export interface User {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
}

interface DecodedToken {
  userId: string;
  email: string;
  username: string;
  roles: UserRole[];
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = async (currentToken: string) => {
    try {
      // Verifica se o token expirou
      const decoded = jwtDecode<DecodedToken>(currentToken);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        throw new Error('Token expirado');
      }

      // Verifica se o token é válido no backend
      await get('/auth/verify', currentToken);
      
      setUser({ id: decoded.userId, email: decoded.email, username: decoded.username, roles: decoded.roles || [] });
      setToken(currentToken);
      return true;
    } catch (error) {
      console.error('Token inválido:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      return false;
    }
  };

  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      verifyToken(currentToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await post<{ accessToken: string }>('/auth/login', {
        email,
        password,
      });
      const newToken = response.accessToken;
      if (newToken) {
        const isValid = await verifyToken(newToken);
        if (isValid) {
          localStorage.setItem('authToken', newToken);
          toast({
            title: 'Login realizado com sucesso!',
            description: 'Bem-vindo de volta!',
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
  };

  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
