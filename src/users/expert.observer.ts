import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class ExpertObserver {
  private readonly logger = new Logger(ExpertObserver.name);

  constructor(private readonly prisma: PrismaService) {}

  checkIfExpert(user: User): boolean {
    return (
      user.reputationScore > 100 &&
      user.accuracyScore > 0.7 &&
      user.votesCount > 50
    );
  }

  @OnEvent('user.score.updated')
  async handleUserScoreUpdated(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const isExpertEligible = this.checkIfExpert(user);

    if (
      isExpertEligible &&
      user.role !== UserRole.EXPERT &&
      user.role !== UserRole.ADMIN
    ) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.EXPERT },
      });
      this.logger.log(
        `User ${user.id} promoted to EXPERT based on dynamic scores.`,
      );
    } else if (!isExpertEligible && user.role === UserRole.EXPERT) {
      // Downgrade if they lost eligibility and were an expert
      // Revert to TRUSTED_USER if they were invited, else USER
      const fallbackRole = user.isInvitedByAdmin
        ? UserRole.TRUSTED_USER
        : UserRole.USER;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: fallbackRole },
      });
      this.logger.log(
        `User ${user.id} demoted from EXPERT to ${fallbackRole}.`,
      );
    }
  }
}
