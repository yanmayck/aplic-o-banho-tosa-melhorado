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
exports.ServiceTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ServiceTypesService = class ServiceTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createServiceTypeDto) {
        try {
            return await this.prisma.serviceType.create({
                data: createServiceTypeDto,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.NotFoundException(`ServiceType with name "${createServiceTypeDto.name}" already exists.`);
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.serviceType.findMany();
    }
    async findOne(id) {
        const serviceType = await this.prisma.serviceType.findUnique({
            where: { id },
        });
        if (!serviceType) {
            throw new common_1.NotFoundException(`ServiceType with ID "${id}" not found`);
        }
        return serviceType;
    }
    async update(id, updateServiceTypeDto) {
        try {
            return await this.prisma.serviceType.update({
                where: { id },
                data: updateServiceTypeDto,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`ServiceType with ID "${id}" not found`);
                }
                if (error.code === 'P2002') {
                    throw new common_1.NotFoundException(`ServiceType with name "${updateServiceTypeDto.name}" already exists.`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.serviceType.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException(`ServiceType with ID "${id}" not found`);
            }
            throw error;
        }
    }
};
exports.ServiceTypesService = ServiceTypesService;
exports.ServiceTypesService = ServiceTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceTypesService);
//# sourceMappingURL=service-types.service.js.map