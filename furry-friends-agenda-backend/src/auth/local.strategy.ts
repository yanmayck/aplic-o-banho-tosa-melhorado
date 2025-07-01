import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
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
} 