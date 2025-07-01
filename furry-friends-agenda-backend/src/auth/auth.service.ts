import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { 
      username: user.email.split('@')[0],
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const newUser = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name || registerDto.email.split('@')[0],
        role: registerDto.roles?.[0] as Role || Role.USER,
      });
      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error during registration: ', error);
      throw new InternalServerErrorException('Could not register user');
    }
  }

  async validateEmployee(email: string, password: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { email },
    });

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
    };
  }

  async loginEmployee(employee: Employee) {
    const payload = { 
      email: employee.email, 
      sub: employee.id,
      role: employee.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      employee: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
      },
    };
  }

  async createEmployee(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    cpf: string;
    phone?: string;
    address?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const employee = await this.prisma.employee.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
    };
  }
}
