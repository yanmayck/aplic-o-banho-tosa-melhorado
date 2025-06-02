import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(req: any): Promise<Omit<User, 'password'> | null>;
    updateMyProfile(req: any, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'> | null>;
}
