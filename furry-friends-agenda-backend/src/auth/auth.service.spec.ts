import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { vi } from 'vitest';

// Mock bcrypt functions
vi.mock('bcrypt', () => ({
    compare: vi.fn(),
}));

// Mock User type for easier testing
const mockUser: User = {
    id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    roles: ['USER'],
    createdAt: new Date(),
    updatedAt: new Date(),
    // phone: null, // Removed as per linter error
    // address: null, // Removed as per linter error
};

const { password, ...mockUserNoPassword } = mockUser;
// delete mockUserNoPassword.password; // Replaced with destructuring


describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    // let prismaService: PrismaService; // PrismaService is used via UsersService mostly

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findOneByEmail: vi.fn(),
                        createUser: vi.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: vi.fn(),
                    },
                },
                {
                    provide: PrismaService, // Mock PrismaService even if indirectly used, for completeness
                    useValue: {
                        // Mock any direct prisma calls if they were in AuthService
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        // prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user if credentials are valid', async () => {
            vi.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
            vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never); // type assertion for bcrypt mock

            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toEqual(mockUserNoPassword);
            expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
        });

        it('should return null if user not found', async () => {
            vi.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
            const result = await service.validateUser('wrong@example.com', 'password');
            expect(result).toBeNull();
        });

        it('should return null if password does not match', async () => {
            vi.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
            vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never); // type assertion

            const result = await service.validateUser('test@example.com', 'wrongpassword');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access token and user if login is successful', async () => {
            const validatedUser = { ...mockUserNoPassword, id: 'user-id-login' };
            // vi.spyOn(service, 'validateUser').mockResolvedValue(validatedUser); // Cannot spy on own methods directly like this easily, better to mock dependencies
            vi.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser); // mockUser has password for validateUser
            vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const token = 'test-access-token';
            vi.spyOn(jwtService, 'sign').mockReturnValue(token);

            const loginDto = { email: 'test@example.com', password: 'password' };
            const result = await service.login(loginDto);

            expect(jwtService.sign).toHaveBeenCalledWith({
                username: validatedUser.email,
                sub: validatedUser.id,
                roles: validatedUser.roles,
            });
            expect(result).toEqual({
                access_token: token,
                user: {
                    id: validatedUser.id,
                    email: validatedUser.email,
                    name: validatedUser.name,
                    roles: validatedUser.roles,
                }
            });
        });

        it('should throw UnauthorizedException if login fails', async () => {
            // vi.spyOn(service, 'validateUser').mockResolvedValue(null);
            vi.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null); // Or bcrypt.compare returns false

            const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('should register a new user and return user data without password', async () => {
            const registerDto = {
                email: 'new@example.com',
                password: 'newpassword',
                name: 'New User',
                roles: ['USER'],
            };
            const createdUser = { ...mockUser, ...registerDto, id: 'new-user-id' };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...expectedUser } = createdUser;


            vi.spyOn(usersService, 'createUser').mockResolvedValue(createdUser);

            const result = await service.register(registerDto);
            expect(usersService.createUser).toHaveBeenCalledWith({
                email: registerDto.email,
                password: registerDto.password,
                name: registerDto.name,
                roles: registerDto.roles,
            });
            expect(result).toEqual(expectedUser);
        });

        it('should throw ConflictException if user already exists', async () => {
            const registerDto = {
                email: 'existing@example.com',
                password: 'password',
                name: 'Existing User',
            };
            vi.spyOn(usersService, 'createUser').mockRejectedValue(
                new ConflictException('User already exists'),
            );

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });

        it('should throw InternalServerErrorException for other errors during registration', async () => {
            const registerDto = {
                email: 'error@example.com',
                password: 'password',
                name: 'Error User',
            };
            vi.spyOn(usersService, 'createUser').mockRejectedValue(
                new Error('Some database error'), // Generic error
            );
            // Mock console.error to prevent logging during tests
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });


            await expect(service.register(registerDto)).rejects.toThrow(InternalServerErrorException);
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
}); 