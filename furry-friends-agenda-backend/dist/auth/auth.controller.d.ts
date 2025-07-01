import { AuthService } from './auth.service';
import { Role } from './enums/role.enum';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: Role;
        };
    }>;
    register(data: {
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
    getProfile(req: any): any;
}
