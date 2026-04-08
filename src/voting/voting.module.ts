import { Module } from '@nestjs/common';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { VoteRepository } from './vote.repository';
import { WeightModule } from '../weight/weight.module';
import { DecisionsModule } from '../decisions/decisions.module';

@Module({
  imports: [WeightModule, DecisionsModule],
  controllers: [VotingController],
  providers: [VotingService, VoteRepository],
  exports: [VotingService],
})
export class VotingModule {}
