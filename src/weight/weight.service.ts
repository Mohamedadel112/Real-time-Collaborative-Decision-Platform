import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { RoleStrategy } from './strategies/role.strategy';
import { ReputationStrategy } from './strategies/reputation.strategy';
import { TrustedStrategy } from './strategies/trusted.strategy';
import { SkillStrategy } from './strategies/skill.strategy';
import { ParticipationStrategy } from './strategies/participation.strategy';

const MAX_TOTAL_WEIGHT = 8.0; // Cap to prevent extreme bias

@Injectable()
export class WeightService {
  constructor(
    private readonly roleStrategy: RoleStrategy,
    private readonly reputationStrategy: ReputationStrategy,
    private readonly trustedStrategy: TrustedStrategy,
    private readonly skillStrategy: SkillStrategy,
    private readonly participationStrategy: ParticipationStrategy,
  ) {}

  /**
   * Calculates the total voting weight for a user on a specific decision.
   * weight = base(role) + trusted_bonus + warm_start + skill_match + participation_bonus + reputation_bonus
   */
  calculateWeight(user: User, decisionDomain?: string): number {
    const context = { user, decisionDomain };

    const roleWeight     = this.roleStrategy.calculate(context);
    const repBonus       = this.reputationStrategy.calculate(context);
    const trustedBonus   = this.trustedStrategy.calculate(context);
    const skillBonus     = this.skillStrategy.calculate(context);
    const partBonus      = this.participationStrategy.calculate(context);

    const total = roleWeight + repBonus + trustedBonus + skillBonus + partBonus;
    return Math.min(total, MAX_TOTAL_WEIGHT);
  }

  getWeightBreakdown(user: User, decisionDomain?: string) {
    const context = { user, decisionDomain };
    return {
      role:          this.roleStrategy.calculate(context),
      reputation:    this.reputationStrategy.calculate(context),
      trusted:       this.trustedStrategy.calculate(context),
      skill:         this.skillStrategy.calculate(context),
      participation: this.participationStrategy.calculate(context),
      total:         this.calculateWeight(user, decisionDomain),
    };
  }
}
