// Types and interfaces for the store
export type ServiceType = "bath" | "grooming" | "both" | "package";
export type TransportType = "pickup" | "delivery" | "none";
export type AppointmentStatus = "waiting" | "progress" | "completed" | "canceled";

// Client model
export interface Client {
  id: string;
  tutorName: string;
  name: string;
  petName: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
}

// Pet model
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  ownerId: string;
  clientId: string;
  rabiesVaccine: {
    isUpToDate: boolean;
    lastDate: string;
  };
}

// Groomer model
export interface Groomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  commission: number;
}

// Appointment model
export interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  petName: string;
  service: ServiceType;
  transport: TransportType;
  price: number;
  status: AppointmentStatus;
  groomerId?: string;
  notes?: string;
  points?: number; // Pontos para o tosador
}

// Commission model
export interface Commission {
  id: string;
  groomerId: string;
  appointmentId: string;
  amount: number;
  date: string;
}

// Package model
export interface Package {
  id: string;
  name: string;
  services: ServiceType[];
  price: number;
  available: boolean;
}

// Groomer Points model
export interface GroomerPoint {
  id: string;
  groomerId: string;
  points: number;
  month: number;
  year: number;
  appointmentId: string;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  HANDLER = 'HANDLER',
}

// Utility function for generating IDs
export const generateId = () => Math.random().toString(36).slice(2, 11);
