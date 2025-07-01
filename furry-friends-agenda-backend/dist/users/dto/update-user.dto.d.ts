import { Role } from '../../auth/enums/role.enum';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    phone?: string;
    cpf?: string;
    address?: string;
}
