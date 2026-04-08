import { Injectable } from '@nestjs/common';
import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';

/**
 * Skill Match Strategy: +1.5 bonus if the decision domain matches
 * one of the user's domain expertise areas.
 */
@Injectable()
export class SkillStrategy implements WeightStrategy {
  calculate(context: WeightContext): number {
    if (!context.decisionDomain) return 0;
    const hasMatch = context.user.domainExpertise.includes(context.decisionDomain);
    return hasMatch ? 1.5 : 0;
  }
}
