import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose }) => {
  const { isAdmin } = useAuth();
  const isEditing = !!employee;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "HANDLER",
    cpf: "",
    phone: "",
    address: "",
  });
  
  // If editing, populate form with employee data
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        password: "",
        confirmPassword: "",
        role: employee.role,
        cpf: employee.cpf,
        phone: employee.phone || "",
        address: employee.address || "",
      });
    }
  }, [employee]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "cpf") {
      // Only allow numbers and limit to 11 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCpf = (cpf: string): string => {
    if (!cpf) return "";
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

  const validateCpf = (cpf: string): boolean => {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.cpf) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios: Nome, Email e CPF.",
        variant: "destructive"
      });
      return;
    }

    // Validate CPF
    if (!validateCpf(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido com 11 dígitos.",
        variant: "destructive"
      });
      return;
    }

    // Validate password for new employees
    if (!isEditing && (!formData.password || !formData.confirmPassword)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a senha e confirmação de senha.",
        variant: "destructive"
      });
      return;
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    // Only allow admin to add/edit employees
    if (!isAdmin) {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem cadastrar ou editar funcionários.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          cpf: formData.cpf,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar funcionário');
      }

      toast({
        title: "Sucesso",
        description: `Funcionário ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o funcionário. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  if (!isAdmin) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Permissão negada</h3>
          <p className="text-sm text-gray-500 mt-2">
            Apenas administradores podem cadastrar ou editar funcionários.
          </p>
          <Button className="mt-4" onClick={onClose}>Voltar</Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Funcionário" : "Novo Funcionário"}</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange} 
            placeholder="Nome completo" 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            name="email" 
            type="email"
            value={formData.email}
            onChange={handleChange} 
            placeholder="email@exemplo.com" 
            required 
          />
        </div>
        
        {!isEditing && (
          <>
            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input 
                id="password" 
                name="password" 
                type="password"
                value={formData.password}
                onChange={handleChange} 
                placeholder="Senha" 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange} 
                placeholder="Confirme a senha" 
                required 
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="role">Função *</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="HANDLER">Tosador</SelectItem>
              <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input 
            id="cpf" 
            name="cpf" 
            value={formatCpf(formData.cpf)}
            onChange={handleChange} 
            placeholder="000.000.000-00"
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            name="phone" 
            value={formData.phone}
            onChange={handleChange} 
            placeholder="(00) 12345-6789"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input 
            id="address" 
            name="address" 
            value={formData.address}
            onChange={handleChange} 
            placeholder="Endereço completo" 
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditing ? "Atualizar" : "Cadastrar"}</Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeForm; 