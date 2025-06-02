import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { ServiceType } from '@prisma/client';
export declare class ServiceTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType>;
    findAll(): Promise<ServiceType[]>;
    findOne(id: string): Promise<ServiceType | null>;
    update(id: string, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType>;
    remove(id: string): Promise<ServiceType>;
}
