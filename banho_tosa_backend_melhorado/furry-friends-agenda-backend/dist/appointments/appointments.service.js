"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
let AppointmentsService = class AppointmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAppointmentDto, clientId) {
        const { petId, serviceTypeId, appointmentDateTime, notes } = createAppointmentDto;
        const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
        if (!pet) {
            throw new common_1.NotFoundException(`Pet with ID "${petId}" not found.`);
        }
        if (pet.ownerId !== clientId) {
            throw new common_1.ForbiddenException('You can only create appointments for your own pets.');
        }
        const serviceType = await this.prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
        if (!serviceType) {
            throw new common_1.NotFoundException(`ServiceType with ID "${serviceTypeId}" not found.`);
        }
        try {
            return await this.prisma.appointment.create({
                data: {
                    appointmentDateTime: new Date(appointmentDateTime),
                    notes,
                    status: create_appointment_dto_1.AppointmentStatus.SCHEDULED,
                    petId,
                    serviceTypeId,
                    clientId,
                },
            });
        }
        catch (error) {
            console.error("Error creating appointment: ", error);
            throw new common_1.BadRequestException('Could not create appointment.');
        }
    }
    async findAllByClient(clientId) {
        return this.prisma.appointment.findMany({
            where: { clientId },
            include: { pet: true, serviceType: true },
            orderBy: { appointmentDateTime: 'asc' },
        });
    }
    async findOneByClient(id, clientId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: { pet: true, serviceType: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${id}" not found`);
        }
        if (appointment.clientId !== clientId) {
            throw new common_1.ForbiddenException('You are not allowed to access this appointment');
        }
        return appointment;
    }
    async update(id, updateAppointmentDto, clientId) {
        const appointment = await this.findOneByClient(id, clientId);
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${id}" not found or not owned by user.`);
        }
        const dataToUpdate = {};
        if (updateAppointmentDto.appointmentDateTime) {
            dataToUpdate.appointmentDateTime = new Date(updateAppointmentDto.appointmentDateTime);
        }
        if (updateAppointmentDto.status) {
            dataToUpdate.status = updateAppointmentDto.status;
        }
        if (updateAppointmentDto.notes !== undefined) {
            dataToUpdate.notes = updateAppointmentDto.notes;
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return appointment;
        }
        return this.prisma.appointment.update({
            where: { id },
            data: dataToUpdate,
        });
    }
    async remove(id, clientId) {
        const appointment = await this.findOneByClient(id, clientId);
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${id}" not found or not owned by user.`);
        }
        return this.prisma.appointment.delete({
            where: { id },
        });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map