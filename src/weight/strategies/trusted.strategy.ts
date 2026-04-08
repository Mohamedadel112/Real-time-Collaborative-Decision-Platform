import { Injectable } from '@nestjs/common';
import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';

/**
 * Trusted User Strategy: +2 bonus if user was invited by an Admin.
 * Also provides warm start bonus for new users (votesCount < 5).
 */
@Injectable()
export class TrustedStrategy implements WeightStrategy {
  calculate(context: WeightContext): number {
    let bonus = 0;
    if (context.user.isInvitedByAdmin) bonus += 2;
    // Warm start: new users with no history get a small bonus
    if (context.user.votesCount < 5) bonus += 0.5;
    return bonus;
  }
}
