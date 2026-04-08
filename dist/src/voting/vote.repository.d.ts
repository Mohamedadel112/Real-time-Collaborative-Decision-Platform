import { PrismaService } from '../database/prisma.service';
export declare class VoteRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUserAndDecision(userId: string, decisionId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        weight: number;
        validation: import("@prisma/client").$Enums.VoteValidationStatus;
        decisionId: string;
        optionId: string;
    } | null>;
    create(data: {
        decisionId: string;
        optionId: string;
        userId: string;
        weight: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        weight: number;
        validation: import("@prisma/client").$Enums.VoteValidationStatus;
        decisionId: string;
        optionId: string;
    }>;
    findByDecision(decisionId: string): Promise<({
        user: {
            username: string;
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        weight: number;
        validation: import("@prisma/client").$Enums.VoteValidationStatus;
        decisionId: string;
        optionId: string;
    })[]>;
}
