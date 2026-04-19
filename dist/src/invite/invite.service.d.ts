import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
export declare class InviteService {
    private readonly prisma;
    private readonly redisService;
    private readonly emailService;
    constructor(prisma: PrismaService, redisService: RedisService, emailService: EmailService);
    createInvite(adminId: string, email: string): Promise<{
        email: string;
        id: string;
        invitedById: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    getInvitesByAdmin(adminId: string): Promise<{
        email: string;
        id: string;
        invitedById: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }[]>;
    acceptInvite(token: string, userData: {
        username: string;
        password: string;
    }): Promise<{
        email: string;
        username: string;
        id: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        isInvitedByAdmin: boolean;
        invitedById: string | null;
        reputationScore: number;
        accuracyScore: number;
        votesCount: number;
        correctVotes: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
