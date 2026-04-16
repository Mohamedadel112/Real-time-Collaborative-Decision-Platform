import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsersRepository } from '../users/users.repository';
import { PromotionService } from './promotion.service';

const REPUTATION_CORRECT = 10;
const REPUTATION_INCORRECT = -3;

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly promotionService: PromotionService,
  ) {}

  /**
   * Called when a decision is validated (correct/incorrect outcome known).
   * Adjusts reputation and then checks for promotion/demotion.
   */
  async updateForUser(userId: string, wasCorrect: boolean): Promise<void> {
    const delta = wasCorrect ? REPUTATION_CORRECT : REPUTATION_INCORRECT;
    await this.usersRepo.updateReputation(userId, delta);
    await this.usersRepo.incrementVotesCount(userId, wasCorrect);
    await this.promotionService.evaluatePromotion(userId);
    this.logger.debug(`User ${userId} reputation updated by ${delta}`);
  }

  @OnEvent('decision.validated', { async: true })
  async handleDecisionValidated(payload: {
    decisionId: string;
    winningOptionId: string;
    votes: Array<{ userId: string; optionId: string }>;
  }) {
    const { winningOptionId, votes } = payload;
    for (const vote of votes) {
      const wasCorrect = vote.optionId === winningOptionId;
      await this.updateForUser(vote.userId, wasCorrect);
    }
  }
}
