import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class PetsController {
    private readonly petsService;
    constructor(petsService: PetsService);
    create(createPetDto: CreatePetDto, req: {
        user: JwtPayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string | null;
        breed: string | null;
        birthDate: Date | null;
        ownerId: string;
    }>;
    findAll(req: {
        user: JwtPayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string | null;
        breed: string | null;
        birthDate: Date | null;
        ownerId: string;
    }[]>;
    findOne(id: string, req: {
        user: JwtPayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string | null;
        breed: string | null;
        birthDate: Date | null;
        ownerId: string;
    } | null>;
    update(id: string, updatePetDto: UpdatePetDto, req: {
        user: JwtPayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string | null;
        breed: string | null;
        birthDate: Date | null;
        ownerId: string;
    }>;
    remove(id: string, req: {
        user: JwtPayload;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        species: string | null;
        breed: string | null;
        birthDate: Date | null;
        ownerId: string;
    }>;
}
