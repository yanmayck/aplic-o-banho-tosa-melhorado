import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, AppointmentStatus } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, Prisma } from '@prisma/client'; // Tipos não serão reconhecidos até o prisma generate

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    async create(createAppointmentDto: CreateAppointmentDto, clientId: string): Promise<Appointment> {
        const { petId, serviceTypeId, appointmentDateTime, notes } = createAppointmentDto;

        // 1. Verificar se o pet existe e pertence ao cliente
        const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
        if (!pet) {
            throw new NotFoundException(`Pet with ID "${petId}" not found.`);
        }
        if (pet.ownerId !== clientId) {
            throw new ForbiddenException('You can only create appointments for your own pets.');
        }

        // 2. Verificar se o tipo de serviço existe
        const serviceType = await this.prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
        if (!serviceType) {
            throw new NotFoundException(`ServiceType with ID "${serviceTypeId}" not found.`);
        }

        // TODO: Adicionar lógica de verificação de disponibilidade (horários conflitantes, etc.)

        try {
            return await this.prisma.appointment.create({
                data: {
                    appointmentDateTime: new Date(appointmentDateTime),
                    notes,
                    status: AppointmentStatus.SCHEDULED, // Status padrão
                    petId,
                    serviceTypeId,
                    clientId,
                },
            });
        } catch (error) {
            // Tratar erros específicos do Prisma se necessário, ex: FK constraint fails (embora as verificações acima devam cobrir)
            console.error("Error creating appointment: ", error);
            throw new BadRequestException('Could not create appointment.');
        }
    }

    async findAllByClient(clientId: string): Promise<Appointment[]> {
        return this.prisma.appointment.findMany({
            where: { clientId },
            include: { pet: true, serviceType: true }, // Incluir detalhes do pet e serviço
            orderBy: { appointmentDateTime: 'asc' },
        });
    }

    async findOneByClient(id: string, clientId: string): Promise<Appointment | null> {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: { pet: true, serviceType: true },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID "${id}" not found`);
        }

        if (appointment.clientId !== clientId) {
            // Em um cenário com admins, eles poderiam ver qualquer agendamento.
            // Por enquanto, apenas o cliente que criou pode ver.
            throw new ForbiddenException('You are not allowed to access this appointment');
        }
        return appointment;
    }

    async update(
        id: string,
        updateAppointmentDto: UpdateAppointmentDto,
        clientId: string,
    ): Promise<Appointment> {
        const appointment = await this.findOneByClient(id, clientId); // Garante que existe e pertence ao cliente
        if (!appointment) {
            // findOneByClient já lança exceção 
            throw new NotFoundException(`Appointment with ID "${id}" not found or not owned by user.`);
        }

        // TODO: Adicionar lógica de verificação de disponibilidade se a data/hora for alterada.

        const dataToUpdate: Prisma.AppointmentUpdateInput = {};
        if (updateAppointmentDto.appointmentDateTime) {
            dataToUpdate.appointmentDateTime = new Date(updateAppointmentDto.appointmentDateTime);
        }
        if (updateAppointmentDto.status) {
            dataToUpdate.status = updateAppointmentDto.status;
        }
        if (updateAppointmentDto.notes !== undefined) { // Permite limpar as notas passando string vazia
            dataToUpdate.notes = updateAppointmentDto.notes;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return appointment; // Nenhum dado para atualizar
        }

        return this.prisma.appointment.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    async remove(id: string, clientId: string): Promise<Appointment> {
        // Geralmente, agendamentos são "cancelados" (mudança de status) em vez de deletados.
        // Mas vamos implementar a deleção física por enquanto.
        const appointment = await this.findOneByClient(id, clientId);
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID "${id}" not found or not owned by user.`);
        }

        return this.prisma.appointment.delete({
            where: { id },
        });
    }

    // TODO: Métodos para administradores (ver todos agendamentos, filtrar por data, etc.)
} 