import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, Search, User, AlertCircle } from "lucide-react";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const EmployeesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(undefined);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar funcionários');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError('Erro ao carregar funcionários. Tente novamente.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de funcionários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir funcionário');
      }

      toast({
        title: "Sucesso",
        description: "Funcionário excluído com sucesso!",
      });

      fetchEmployees();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o funcionário.",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(undefined);
  };

  // Filter employees based on search query and role filter
  const filteredEmployees = employees.filter((employee: any) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatCpf = (cpf: string): string => {
    if (!cpf) return "Não informado";
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'HANDLER':
        return 'Tosador';
      case 'RECEPTIONIST':
        return 'Recepcionista';
      default:
        return role;
    }
  };

  if (!isAdmin) {
    return (
      <Layout activePage="employees" setActivePage={() => {}}>
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Permissão negada</h3>
            <p className="text-sm text-gray-500 mt-2">
              Apenas administradores podem acessar esta página.
            </p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout activePage="employees" setActivePage={() => {}}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar funcionário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as funções</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="HANDLER">Tosador</SelectItem>
              <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando funcionários...</p>
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-500">Erro</h3>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
              <Button className="mt-4" onClick={fetchEmployees}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : filteredEmployees.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum funcionário encontrado</h3>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery || roleFilter
                  ? "Tente ajustar os filtros de busca"
                  : "Adicione um novo funcionário clicando no botão acima"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee: any) => (
              <Card key={employee.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                    <p className="text-sm text-gray-500">CPF: {formatCpf(employee.cpf)}</p>
                    <p className="text-sm text-gray-500">Função: {getRoleLabel(employee.role)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showForm && (
          <EmployeeForm
            employee={editingEmployee}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </Layout>
  );
};

export default EmployeesPage; 