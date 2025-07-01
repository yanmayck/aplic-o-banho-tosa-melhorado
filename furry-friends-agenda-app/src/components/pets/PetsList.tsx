import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useStore } from "@/context/StoreContext";
import { Pet, Client } from "@/context/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Search, Dog, AlertCircle, RefreshCw } from "lucide-react";
import PetForm from "./PetForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PetsList: React.FC = () => {
  const { pets, deletePet, clients, getPetsByClientId, isLoading, error, refetchPets } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | undefined>(undefined);
  
  // Filter pets based on search query and client filter
  let filteredPets = pets;
  
  if (clientFilter) {
    filteredPets = getPetsByClientId(clientFilter);
  }
  
  if (searchQuery) {
    filteredPets = filteredPets.filter(pet =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };
  
  const handleDeletePet = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este pet?")) {
      deletePet(id);
    }
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPet(undefined);
  };
  
  // Check if vaccines are up to date or about to expire
  const checkVaccinationStatus = (pet: Pet): { status: 'ok' | 'warning' | 'expired', message: string } => {
    if (!pet.rabiesVaccine.isUpToDate) {
      return {
        status: 'expired',
        message: 'Vacina contra raiva vencida'
      };
    }
    
    const rabiesDate = new Date(pet.rabiesVaccine.lastDate);
    const currentDate = new Date();
    
    // Calculate difference in months
    const diffMonths = (currentDate.getFullYear() - rabiesDate.getFullYear()) * 12 + 
                       (currentDate.getMonth() - rabiesDate.getMonth());
                       
    if (diffMonths >= 10 && diffMonths < 12) {
      // Expiring in next 2 months
      return {
        status: 'warning',
        message: 'Vacina contra raiva expira em breve'
      };
    }
    
    if (diffMonths >= 12) {
      return {
        status: 'expired',
        message: 'Vacina contra raiva vencida'
      };
    }
    
    return {
      status: 'ok',
      message: 'Vacinas em dia'
    };
  };
  
  const getClientName = (clientId: string): string => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? client.tutorName : "Cliente desconhecido";
  };
  
  const renderPetsList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => refetchPets()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (filteredPets.length === 0) {
      return (
        <Alert>
          <Dog className="h-4 w-4" />
          <AlertTitle>Nenhum pet encontrado</AlertTitle>
          <AlertDescription>
            {searchQuery || clientFilter
              ? "Tente ajustar os filtros de busca"
              : "Adicione um novo pet clicando no botão acima"}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPets.map((pet) => {
          const vacStatus = checkVaccinationStatus(pet);
          
          return (
            <Card key={pet.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{pet.name}</h3>
                  <p className="text-sm text-gray-500">
                    {clients.find((c) => c.id === pet.clientId)?.name || "Cliente não encontrado"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPet(pet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePet(pet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Layout activePage="pets" setActivePage={() => {}}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pets</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pet
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar pet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={clientFilter}
            onValueChange={setClientFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderPetsList()}

        {showForm && (
          <PetForm
            pet={editingPet}
            onClose={handleCloseForm}
            clientId={clientFilter}
          />
        )}
      </div>
    </Layout>
  );
};

export default PetsList;
