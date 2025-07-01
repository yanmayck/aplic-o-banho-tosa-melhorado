import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: {
        sub: string;
        username: string;
        roles?: string[];
    }): {
        userId: string;
        username: string;
        roles: string[];
    };
}
export {};
