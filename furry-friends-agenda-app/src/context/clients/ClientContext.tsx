import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Client, Role } from '../models/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../AuthContext';
import { get, post, patch, del } from '../utils/api-client';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const fetchClients = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await get<Client[]>('/users', token);
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast({
        title: 'Erro ao buscar clientes',
        description: 'Não foi possível carregar a lista de clientes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    } else {
      setClients([]);
    }
  }, [isAuthenticated, fetchClients]);

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const newClient = await post<Client>(
        '/users',
        { ...client, role: Role.USER },
        token,
      );
      setClients((prev) => [...prev, newClient]);
      toast({
        title: 'Cliente adicionado!',
        description: 'O novo cliente foi adicionado com sucesso.',
      });
    } catch (error) {
      console.error('Failed to add client:', error);
      toast({
        title: 'Erro ao adicionar cliente',
        variant: 'destructive',
      });
    }
  };

  const updateClient = async (client: Client) => {
    try {
      const updatedClient = await patch<Client>(
        `/users/${client.id}`,
        client,
        token,
      );
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? updatedClient : c)),
      );
      toast({
        title: 'Cliente atualizado!',
        description: 'Os dados do cliente foram atualizados com sucesso.',
      });
    } catch (error) {
      console.error('Failed to update client:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        variant: 'destructive',
      });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await del(`/users/${id}`, token);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: 'Cliente excluído!',
        description: 'O cliente foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast({
        title: 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    }
  };

  const getClientById = (id: string) => {
    return clients.find((client) => client.id === id);
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        isLoading,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
