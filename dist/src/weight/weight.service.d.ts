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
    calculate(user: User & {
        skills?: UserSkill[];
    }, decision: Decision): WeightResult;
}
export declare class DefaultWeightStrategy implements WeightCalculationStrategy {
    calculate(user: User & {
        skills?: UserSkill[];
    }, decision: Decision): WeightResult;
}
export declare class WeightService {
    private strategy;
    constructor(strategy: DefaultWeightStrategy);
    setStrategy(strategy: WeightCalculationStrategy): void;
    calculateUserWeight(user: User & {
        skills?: UserSkill[];
    }, decision: Decision): WeightResult;
}
