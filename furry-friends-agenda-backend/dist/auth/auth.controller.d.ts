import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<Omit<{
        name: string | null;
        id: string;
        email: string;
        password: string;
        roles: string[];
        createdAt: Date;
        updatedAt: Date;
    }, "password"> | null>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            roles: string[];
        };
    }>;
}
