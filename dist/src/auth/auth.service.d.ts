import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
            reputation: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
            reputation: any;
        };
    }>;
    private buildTokenResponse;
    validateUser(payload: any): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        isInvitedByAdmin: boolean;
        reputation: number;
        votesCount: number;
        correctVotes: number;
        domainExpertise: string[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
