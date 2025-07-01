import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../auth/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findOneById(id: string): Promise<User | null>;
    findOneByEmail(email: string): Promise<User | null>;
    findAll(role?: Role): Promise<Omit<User, 'password'>[]>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<User>;
}
