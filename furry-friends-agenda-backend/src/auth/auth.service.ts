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
import { User } from '@prisma/client'; // Import User type

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Mantido por enquanto devido ao Omit<User, 'password'>
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.email, sub: user.id, roles: user.roles }; // Incluir roles no payload
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const newUser = await this.usersService.createUser({
        email: registerDto.email,
        password: registerDto.password, // Hashing é feito no UsersService
        name: registerDto.name,
        roles: registerDto.roles || ['USER'], // Default role if not provided
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = newUser; // Mantido por enquanto devido ao Omit<User, 'password'>
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw conflict exception
      }
      // Log the error for debugging purposes
      console.error('Error during registration: ', error);
      throw new InternalServerErrorException('Could not register user');
    }
  }
}
