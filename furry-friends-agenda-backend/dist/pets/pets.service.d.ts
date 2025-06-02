import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from '@prisma/client';
export declare class PetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPetDto: CreatePetDto, ownerId: string): Promise<Pet>;
    findAllByOwner(ownerId: string): Promise<Pet[]>;
    findOneByOwner(id: string, ownerId: string): Promise<Pet | null>;
    update(id: string, updatePetDto: UpdatePetDto, ownerId: string): Promise<Pet>;
    remove(id: string, ownerId: string): Promise<Pet>;
}
