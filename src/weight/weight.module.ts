import { Module } from '@nestjs/common';
import { WeightService } from './weight.service';
import { RoleStrategy } from './strategies/role.strategy';
import { ReputationStrategy } from './strategies/reputation.strategy';
import { TrustedStrategy } from './strategies/trusted.strategy';
import { SkillStrategy } from './strategies/skill.strategy';
import { ParticipationStrategy } from './strategies/participation.strategy';

@Module({
  providers: [
    WeightService,
    RoleStrategy,
    ReputationStrategy,
    TrustedStrategy,
    SkillStrategy,
    ParticipationStrategy,
  ],
  exports: [WeightService],
})
export class WeightModule {}
