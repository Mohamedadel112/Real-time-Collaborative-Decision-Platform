import { PrismaService } from '../database/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        reputationScore: number;
        accuracyScore: number;
        votesCount: number;
        correctVotes: number;
        createdAt: Date;
        skills: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            tag: string;
            level: number;
        }[];
    }>;
    getAccuracyRate(userId: string): Promise<number>;
}
