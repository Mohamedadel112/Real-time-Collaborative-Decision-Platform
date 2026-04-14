import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WeightService } from '../weight/weight.service';
import { DecisionsRepository } from '../decisions/decisions.repository';
import { VoteRepository } from './vote.repository';
export declare class VotingService {
    private readonly prisma;
    private readonly redis;
    private readonly weightService;
    private readonly decisionRepo;
    private readonly voteRepo;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, redis: RedisService, weightService: WeightService, decisionRepo: DecisionsRepository, voteRepo: VoteRepository, eventEmitter: EventEmitter2);
    castVote(decisionId: string, optionId: string, userId: string): Promise<{
        voteId: string;
        weight: number;
        breakdown: {
            role: number;
            reputation: number;
            trusted: number;
            skill: number;
            participation: number;
            total: number;
        };
    }>;
    getVotes(decisionId: string): Promise<({
        user: {
            id: string;
            username: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        decisionId: string;
        optionId: string;
        weight: number;
        validation: import("@prisma/client").$Enums.VoteValidationStatus;
    })[]>;
}
