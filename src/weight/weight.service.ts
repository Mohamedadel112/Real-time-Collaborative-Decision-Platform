import { Injectable } from '@nestjs/common';
import { User, Decision, UserSkill } from '@prisma/client';

export interface WeightBreakdown {
  base: number;
  trusted: number;
  warmStart: number;
  skill: number;
  reputation: number;
  accuracy: number;
}

export interface WeightResult {
  weight: number;
  explanation: string[];
}

export interface WeightCalculationStrategy {
  calculate(
    user: User & { skills?: UserSkill[] },
    decision: Decision,
  ): WeightResult;
}

@Injectable()
export class DefaultWeightStrategy implements WeightCalculationStrategy {
  calculate(
    user: User & { skills?: UserSkill[] },
    decision: Decision,
  ): WeightResult {
    const breakdown: WeightBreakdown = {
      base: 1,
      trusted: 0,
      warmStart: 0,
      skill: 0,
      reputation: 0,
      accuracy: 0,
    };

    if (user.isInvitedByAdmin) breakdown.trusted = 2;
    if (user.reputationScore === 0) breakdown.warmStart = 1;

    // Check if user has a skill matching the decision domain
    if (decision.domain && user.skills) {
      const hasSkill = user.skills.some(
        (skill) => skill.tag === decision.domain,
      );
      if (hasSkill) breakdown.skill = 2;
    }

    breakdown.reputation = parseFloat((user.reputationScore * 0.1).toFixed(2));
    breakdown.accuracy = parseFloat((user.accuracyScore * 0.2).toFixed(2));

    const totalWeight =
      breakdown.base +
      breakdown.trusted +
      breakdown.warmStart +
      breakdown.skill +
      breakdown.reputation +
      breakdown.accuracy;

    const explanation: string[] = [];
    if (breakdown.base > 0) explanation.push(`+${breakdown.base} Base`);
    if (breakdown.trusted > 0)
      explanation.push(`+${breakdown.trusted} Trusted User`);
    if (breakdown.warmStart > 0)
      explanation.push(`+${breakdown.warmStart} Warm Start`);
    if (breakdown.skill > 0)
      explanation.push(`+${breakdown.skill} Skill Match`);
    if (breakdown.reputation > 0)
      explanation.push(`+${breakdown.reputation} Reputation`);
    if (breakdown.accuracy > 0)
      explanation.push(`+${breakdown.accuracy} Accuracy`);

    return {
      weight: parseFloat(totalWeight.toFixed(2)),
      explanation,
    };
  }
}

@Injectable()
export class WeightService {
  constructor(private strategy: DefaultWeightStrategy) {}

  setStrategy(strategy: WeightCalculationStrategy) {
    this.strategy = strategy as DefaultWeightStrategy; // In a larger system, would be injected or chosen from registry
  }

  calculateUserWeight(
    user: User & { skills?: UserSkill[] },
    decision: Decision,
  ): WeightResult {
    return this.strategy.calculate(user, decision);
  }
}
