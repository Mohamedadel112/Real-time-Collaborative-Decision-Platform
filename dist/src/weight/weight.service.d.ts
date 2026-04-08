import { User } from '@prisma/client';
import { RoleStrategy } from './strategies/role.strategy';
import { ReputationStrategy } from './strategies/reputation.strategy';
import { TrustedStrategy } from './strategies/trusted.strategy';
import { SkillStrategy } from './strategies/skill.strategy';
import { ParticipationStrategy } from './strategies/participation.strategy';
export declare class WeightService {
    private readonly roleStrategy;
    private readonly reputationStrategy;
    private readonly trustedStrategy;
    private readonly skillStrategy;
    private readonly participationStrategy;
    constructor(roleStrategy: RoleStrategy, reputationStrategy: ReputationStrategy, trustedStrategy: TrustedStrategy, skillStrategy: SkillStrategy, participationStrategy: ParticipationStrategy);
    calculateWeight(user: User, decisionDomain?: string): number;
    getWeightBreakdown(user: User, decisionDomain?: string): {
        role: number;
        reputation: number;
        trusted: number;
        skill: number;
        participation: number;
        total: number;
    };
}
