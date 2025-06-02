import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { ServiceType, Prisma } from '@prisma/client'; // O tipo ServiceType não será reconhecido até o prisma generate

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createServiceTypeDto: CreateServiceTypeDto,
  ): Promise<ServiceType> {
    try {
      return await this.prisma.serviceType.create({
        data: createServiceTypeDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // P2002 é o código para violação de constraint unique (ex: nome duplicado)
        throw new NotFoundException(
          `ServiceType with name "${createServiceTypeDto.name}" already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<ServiceType[]> {
    return this.prisma.serviceType.findMany();
  }

  async findOne(id: string): Promise<ServiceType | null> {
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id },
    });
    if (!serviceType) {
      throw new NotFoundException(`ServiceType with ID "${id}" not found`);
    }
    return serviceType;
  }

  async update(
    id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
  ): Promise<ServiceType> {
    try {
      return await this.prisma.serviceType.update({
        where: { id },
        data: updateServiceTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record to update not found.
          throw new NotFoundException(`ServiceType with ID "${id}" not found`);
        }
        if (error.code === 'P2002') {
          throw new NotFoundException(
            `ServiceType with name "${updateServiceTypeDto.name}" already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<ServiceType> {
    try {
      return await this.prisma.serviceType.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`ServiceType with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
