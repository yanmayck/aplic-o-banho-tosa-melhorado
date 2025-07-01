import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Groomer, Role } from '../models/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../AuthContext';
import { get, post, patch, del } from '../utils/api-client';

interface GroomerContextType {
  groomers: Groomer[];
  addGroomer: (groomer: Omit<Groomer, 'id' | 'commission'>) => Promise<void>;
  updateGroomer: (groomer: Groomer) => Promise<void>;
  deleteGroomer: (id: string) => Promise<void>;
  getGroomerById: (id: string) => Groomer | undefined;
  isLoading: boolean;
}

const GroomerContext = createContext<GroomerContextType | undefined>(
  undefined,
);

export const GroomerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const fetchGroomers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await get<Groomer[]>(`/users?role=${Role.HANDLER}`, token);
      setGroomers(data);
    } catch (error) {
      console.error('Failed to fetch groomers:', error);
      toast({
        title: 'Erro ao buscar tosadores',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGroomers();
    } else {
      setGroomers([]);
    }
  }, [isAuthenticated, fetchGroomers]);

  const addGroomer = async (groomer: Omit<Groomer, 'id' | 'commission'>) => {
    try {
      const newGroomer = await post<Groomer>(
        '/users',
        { ...groomer, role: Role.HANDLER },
        token,
      );
      setGroomers((prev) => [...prev, newGroomer]);
      toast({
        title: 'Tosador adicionado!',
      });
    } catch (error) {
      console.error('Failed to add groomer:', error);
      toast({
        title: 'Erro ao adicionar tosador',
        variant: 'destructive',
      });
    }
  };

  const updateGroomer = async (groomer: Groomer) => {
    try {
      const updatedGroomer = await patch<Groomer>(
        `/users/${groomer.id}`,
        groomer,
        token,
      );
      setGroomers((prev) =>
        prev.map((g) => (g.id === groomer.id ? updatedGroomer : g)),
      );
      toast({
        title: 'Tosador atualizado!',
      });
    } catch (error) {
      console.error('Failed to update groomer:', error);
      toast({
        title: 'Erro ao atualizar tosador',
        variant: 'destructive',
      });
    }
  };

  const deleteGroomer = async (id: string) => {
    try {
      await del(`/users/${id}`, token);
      setGroomers((prev) => prev.filter((g) => g.id !== id));
      toast({ title: 'Tosador excluído!' });
    } catch (error) {
      console.error('Failed to delete groomer:', error);
      toast({
        title: 'Erro ao excluir tosador',
        variant: 'destructive',
      });
    }
  };

  const getGroomerById = (id: string) => {
    return groomers.find((groomer) => groomer.id === id);
  };

  return (
    <GroomerContext.Provider
      value={{
        groomers,
        addGroomer,
        updateGroomer,
        deleteGroomer,
        getGroomerById,
        isLoading,
      }}
    >
      {children}
    </GroomerContext.Provider>
  );
};

export const useGroomers = () => {
  const context = useContext(GroomerContext);
  if (context === undefined) {
    throw new Error('useGroomers must be used within a GroomerProvider');
  }
  return context;
};