import { PrismaService } from '../database/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        reputation: number;
        votesCount: number;
        correctVotes: number;
        domainExpertise: string[];
        createdAt: Date;
    }>;
    getAccuracyRate(userId: string): Promise<number>;
}
