import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';

// Base weight by role as defined in PRD
const ROLE_BASE_WEIGHTS: Record<UserRole, number> = {
  [UserRole.GUEST]: 0.5,
  [UserRole.USER]: 1.0,
  [UserRole.TRUSTED_USER]: 2.0,
  [UserRole.EXPERT]: 3.0,
  [UserRole.ADMIN]: 1.0, // Admin's voting power is same as user (avoid bias)
};

@Injectable()
export class RoleStrategy implements WeightStrategy {
  calculate(context: WeightContext): number {
    return ROLE_BASE_WEIGHTS[context.user.role] ?? 1.0;
  }
}
