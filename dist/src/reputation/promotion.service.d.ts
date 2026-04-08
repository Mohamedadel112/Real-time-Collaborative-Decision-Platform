import { PrismaService } from '../database/prisma.service';
import { UsersRepository } from '../users/users.repository';
export declare class PromotionService {
    private readonly prisma;
    private readonly usersRepo;
    private readonly logger;
    constructor(prisma: PrismaService, usersRepo: UsersRepository);
    evaluatePromotion(userId: string): Promise<void>;
}
