import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, roundsOfHashing);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      // throw new NotFoundException(`User with ID "${id}" not found`);
      return null; // It might be better to return null for auth purposes
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // throw new NotFoundException(`User with email "${email}" not found`);
      return null; // It might be better to return null for auth purposes
    }
    return user;
  }

  // Add other methods like findAll, updateUser, deleteUser as needed

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return user;
    } catch (error) {
      // Pode ser PrismaClientKnownRequestError se o usuário não for encontrado (P2025)
      // ou outros erros de validação do Prisma.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      // Logar o erro para depuração e relançar ou tratar de forma mais genérica
      console.error('Error updating user:', error);
      throw error;
    }
  }
}
