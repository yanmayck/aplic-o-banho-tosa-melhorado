import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        appointmentDateTime: Date;
        status: string;
        notes: string | null;
        petId: string;
        serviceTypeId: string;
        clientId: string;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        appointmentDateTime: Date;
        status: string;
        notes: string | null;
        petId: string;
        serviceTypeId: string;
        clientId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        appointmentDateTime: Date;
        status: string;
        notes: string | null;
        petId: string;
        serviceTypeId: string;
        clientId: string;
    } | null>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        appointmentDateTime: Date;
        status: string;
        notes: string | null;
        petId: string;
        serviceTypeId: string;
        clientId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        appointmentDateTime: Date;
        status: string;
        notes: string | null;
        petId: string;
        serviceTypeId: string;
        clientId: string;
    }>;
}
