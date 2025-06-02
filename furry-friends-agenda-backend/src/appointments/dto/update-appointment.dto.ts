import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { AppointmentStatus } from './create-appointment.dto'; // Reutilizando o enum

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentDateTime?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
