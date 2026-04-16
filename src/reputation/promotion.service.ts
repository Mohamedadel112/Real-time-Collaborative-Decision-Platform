import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { UserRole } from '@prisma/client';

// Expert promotion conditions as per PRD
const EXPERT_REPUTATION_THRESHOLD = 100;
const EXPERT_ACCURACY_THRESHOLD = 70;
const EXPERT_VOTES_THRESHOLD = 50;

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepo: UsersRepository,
  ) {}

  async evaluatePromotion(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // Skip admins
    if (user.role === UserRole.ADMIN) return;

    const accuracy =
      user.votesCount > 0 ? (user.correctVotes / user.votesCount) * 100 : 0;
    const qualifiesForExpert =
      user.reputationScore >= EXPERT_REPUTATION_THRESHOLD &&
      accuracy >= EXPERT_ACCURACY_THRESHOLD &&
      user.votesCount >= EXPERT_VOTES_THRESHOLD;

    if (qualifiesForExpert && user.role !== UserRole.EXPERT) {
      await this.usersRepo.updateRole(userId, UserRole.EXPERT);
      this.logger.log(`🎖️  User ${user.username} promoted to EXPERT`);
    } else if (!qualifiesForExpert && user.role === UserRole.EXPERT) {
      // Dynamic demotion if no longer meets criteria
      await this.usersRepo.updateRole(userId, UserRole.USER);
      this.logger.log(`📉 User ${user.username} demoted from EXPERT`);
    }
  }
}
