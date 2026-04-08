import { UsersRepository } from '../users/users.repository';
import { PromotionService } from './promotion.service';
export declare class ReputationService {
    private readonly usersRepo;
    private readonly promotionService;
    private readonly logger;
    constructor(usersRepo: UsersRepository, promotionService: PromotionService);
    updateForUser(userId: string, wasCorrect: boolean): Promise<void>;
    handleDecisionValidated(payload: {
        decisionId: string;
        winningOptionId: string;
        votes: Array<{
            userId: string;
            optionId: string;
        }>;
    }): Promise<void>;
}
