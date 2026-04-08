import { Injectable } from '@nestjs/common';
import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';

/**
 * Reputation bonus – adds scaled bonus based on reputation score.
 * Max bonus: 2.0 (capped to prevent expert bias)
 */
@Injectable()
export class ReputationStrategy implements WeightStrategy {
  private readonly MAX_BONUS = 2.0;
  private readonly SCALE_FACTOR = 200; // Every 200 reputation = 1 bonus point

  calculate(context: WeightContext): number {
    if (context.user.reputation <= 0) return 0;
    const bonus = context.user.reputation / this.SCALE_FACTOR;
    return Math.min(bonus, this.MAX_BONUS);
  }
}
