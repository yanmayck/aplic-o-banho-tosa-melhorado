import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enums/role.enum';
interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: Role;
    cpf?: string;
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Employee {
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    cpf: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuthService {
    private prisma;
    private jwtService;
    private usersService;
    constructor(prisma: PrismaService, jwtService: JwtService, usersService: UsersService);
    validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: Role;
        };
    }>;
    register(registerDto: RegisterDto): Promise<Omit<User, 'password'> | null>;
    validateEmployee(email: string, password: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
    loginEmployee(employee: Employee): Promise<{
        access_token: string;
        employee: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    createEmployee(data: {
        email: string;
        password: string;
        name: string;
        role: string;
        cpf: string;
        phone?: string;
        address?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
}
export {};
