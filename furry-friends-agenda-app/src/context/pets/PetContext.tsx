import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Pet } from '../models/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../AuthContext';
import { get, post, patch, del } from '../utils/api-client';

interface PetContextType {
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id' | 'ownerId'>) => Promise<void>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPetById: (id: string) => Pet | undefined;
  getPetsByClientId: (clientId: string) => Pet[];
  isLoading: boolean;
  error: string | null;
  refetchPets: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  const fetchPets = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await get<Pet[]>('/pets', token);
      setPets(data);
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      setError('Não foi possível carregar a lista de pets');
      toast({
        title: 'Erro ao buscar pets',
        description: 'Não foi possível carregar a lista de pets. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets();
    } else {
      setPets([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchPets]);

  const addPet = async (pet: Omit<Pet, 'id' | 'ownerId'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPet = await post<Pet>('/pets', pet, token);
      setPets((prev) => [...prev, newPet]);
      toast({
        title: 'Pet adicionado!',
        description: 'O pet foi cadastrado com sucesso.',
      });
    } catch (error) {
      console.error('Failed to add pet:', error);
      setError('Não foi possível adicionar o pet');
      toast({
        title: 'Erro ao adicionar pet',
        description: 'Não foi possível cadastrar o pet. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePet = async (pet: Pet) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedPet = await patch<Pet>(`/pets/${pet.id}`, pet, token);
      setPets((prev) =>
        prev.map((p) => (p.id === pet.id ? updatedPet : p)),
      );
      toast({
        title: 'Pet atualizado!',
        description: 'As informações do pet foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Failed to update pet:', error);
      setError('Não foi possível atualizar o pet');
      toast({
        title: 'Erro ao atualizar pet',
        description: 'Não foi possível atualizar as informações do pet. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePet = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await del(`/pets/${id}`, token);
      setPets((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: 'Pet removido!',
        description: 'O pet foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Failed to delete pet:', error);
      setError('Não foi possível remover o pet');
      toast({
        title: 'Erro ao remover pet',
        description: 'Não foi possível remover o pet. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPetById = (id: string) => {
    return pets.find((p) => p.id === id);
  };

  const getPetsByClientId = (clientId: string) => {
    return pets.filter((p) => p.ownerId === clientId);
  };

  const value = {
    pets,
    addPet,
    updatePet,
    deletePet,
    getPetById,
    getPetsByClientId,
    isLoading,
    error,
    refetchPets: fetchPets,
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
};