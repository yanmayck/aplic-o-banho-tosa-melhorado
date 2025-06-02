import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from '@prisma/client';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(createPetDto: CreatePetDto, ownerId: string): Promise<Pet> {
    return this.prisma.pet.create({
      data: {
        ...createPetDto,
        ownerId,
      },
    });
  }

  async findAllByOwner(ownerId: string): Promise<Pet[]> {
    return this.prisma.pet.findMany({
      where: { ownerId },
    });
  }

  async findOneByOwner(id: string, ownerId: string): Promise<Pet | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID "${id}" not found`);
    }

    if (pet.ownerId !== ownerId) {
      throw new ForbiddenException('You are not allowed to access this pet');
    }
    return pet;
  }

  async update(
    id: string,
    updatePetDto: UpdatePetDto,
    ownerId: string,
  ): Promise<Pet> {
    const pet = await this.findOneByOwner(id, ownerId); // Garante que o pet existe e pertence ao usuário
    if (!pet) {
      // findOneByOwner já lança exceção, mas por segurança:
      throw new NotFoundException(
        `Pet with ID "${id}" not found or not owned by user.`,
      );
    }

    return this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
    });
  }

  async remove(id: string, ownerId: string): Promise<Pet> {
    const pet = await this.findOneByOwner(id, ownerId); // Garante que o pet existe e pertence ao usuário
    if (!pet) {
      // findOneByOwner já lança exceção
      throw new NotFoundException(
        `Pet with ID "${id}" not found or not owned by user.`,
      );
    }
    return this.prisma.pet.delete({
      where: { id },
    });
  }
}
