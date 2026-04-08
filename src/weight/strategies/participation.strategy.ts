import { Injectable } from '@nestjs/common';
import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';

/**
 * Participation Bonus: rewards active members.
 * Scaled bonus based on total votes cast (up to 1.0 max).
 */
@Injectable()
export class ParticipationStrategy implements WeightStrategy {
  private readonly MAX_BONUS = 1.0;
  private readonly SCALE = 50; // Every 50 votes = 1 participation point

  calculate(context: WeightContext): number {
    const bonus = context.user.votesCount / this.SCALE;
    return Math.min(bonus, this.MAX_BONUS);
  }
}
