import { PrismaService } from '../database/prisma.service';
import { User } from '@prisma/client';
export declare class ExpertObserver {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    checkIfExpert(user: User): boolean;
    handleUserScoreUpdated(userId: string): Promise<void>;
}
