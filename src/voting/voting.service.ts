import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WeightService } from '../weight/weight.service';
import { DecisionsRepository } from '../decisions/decisions.repository';
import { VoteRepository } from './vote.repository';
import { DecisionStatus } from '@prisma/client';

@Injectable()
export class VotingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly weightService: WeightService,
    private readonly decisionRepo: DecisionsRepository,
    private readonly voteRepo: VoteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async castVote(decisionId: string, optionId: string, userId: string) {
    // 1. Verify decision is open
    const decision = await this.decisionRepo.findById(decisionId);
    if (!decision) throw new NotFoundException('Decision not found');
    if (decision.status !== DecisionStatus.OPEN) {
      throw new BadRequestException('Decision is not open for voting');
    }

    // 2. Check for duplicate vote (DB unique constraint as backup)
    const existing = await this.voteRepo.findByUserAndDecision(userId, decisionId);
    if (existing) throw new ConflictException('Already voted on this decision');

    // 3. Redis lock to prevent race conditions
    const lockKey = `vote:${decisionId}:${userId}`;
    const acquired = await this.redis.acquireLock(lockKey, 5000);
    if (!acquired) throw new ConflictException('Vote is being processed, please retry');

    try {
      // 4. Fetch user and calculate weight
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const weight = this.weightService.calculateWeight(user, decision.domain ?? undefined);

      // 5. Save the vote
      const vote = await this.voteRepo.create({ decisionId, optionId, userId, weight });

      // 6. Update option's aggregated weight in DB
      await this.decisionRepo.updateOptionWeight(optionId, weight);

      // 7. Emit event for DecisionEngine to recalculate + broadcast
      this.eventEmitter.emit('vote.cast', { decisionId, vote, weight, roomId: decision.roomId });

      return {
        voteId: vote.id,
        weight,
        breakdown: this.weightService.getWeightBreakdown(user, decision.domain ?? undefined),
      };
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  async getVotes(decisionId: string) {
    return this.voteRepo.findByDecision(decisionId);
  }
}
