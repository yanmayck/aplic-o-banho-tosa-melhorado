import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from '../constants/jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || jwtConstants.secret,
    });
  }

  // Torna validate síncrono e tipa o payload
  validate(payload: { sub: string; username: string; roles?: string[] }): {
    userId: string;
    username: string;
    roles: string[];
  } {
    // Aqui você pode adicionar lógica para buscar o usuário no banco de dados
    // ou verificar se o usuário ainda é válido, etc.
    // O objeto retornado aqui será injetado no objeto Request como req.user
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles || [], // Garante que roles seja um array, mesmo que undefined no payload
    };
  }
}
