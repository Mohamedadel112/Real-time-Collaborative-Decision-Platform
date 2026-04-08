import { User } from '@prisma/client';
export interface WeightContext {
    user: User;
    decisionDomain?: string;
}
export interface WeightStrategy {
    calculate(context: WeightContext): number;
}
