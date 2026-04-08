import { Module } from '@nestjs/common';
import { DecisionEngineService } from './decision-engine.service';
import { RoomsModule } from '../rooms/rooms.module';
import { DecisionsModule } from '../decisions/decisions.module';

@Module({
  imports: [RoomsModule, DecisionsModule],
  providers: [DecisionEngineService],
  exports: [DecisionEngineService],
})
export class DecisionEngineModule {}
