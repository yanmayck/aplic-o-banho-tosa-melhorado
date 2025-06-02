import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

// Definindo um enum para o status do agendamento para melhor controle
// No futuro, isso poderia vir do schema.prisma se usarmos Prisma Enums
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  serviceTypeId: string;

  @IsDateString()
  @IsNotEmpty()
  appointmentDateTime: string; // Data e hora do agendamento

  @IsOptional()
  @IsString()
  notes?: string;

  // clientId será pego do usuário logado no serviço
  // status inicial pode ser definido no serviço, ex: 'SCHEDULED'
}
