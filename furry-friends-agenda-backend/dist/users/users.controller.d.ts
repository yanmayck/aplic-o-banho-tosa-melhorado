import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../auth/enums/role.enum';
import { User } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        email: string;
        phone: string | null;
        cpf: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(role?: Role): Promise<Omit<{
        name: string;
        email: string;
        phone: string | null;
        cpf: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, "password">[]>;
    findOne(id: string): Promise<Omit<User, 'password'>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        phone: string | null;
        cpf: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        email: string;
        phone: string | null;
        cpf: string | null;
        address: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
