import { Role } from '../../auth/enums/role.enum';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome não pode estar vazio' })
    name: string;

    @IsEmail({}, { message: 'Por favor, insira um email válido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    cpf?: string;

    @IsString()
    @IsOptional()
    address?: string;
} 