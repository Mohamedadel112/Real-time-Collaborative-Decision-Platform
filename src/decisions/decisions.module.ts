import { Module } from '@nestjs/common';
import { DecisionsController } from './decisions.controller';
import { DecisionsService } from './decisions.service';
import { DecisionsRepository } from './decisions.repository';

@Module({
  controllers: [DecisionsController],
  providers: [DecisionsService, DecisionsRepository],
  exports: [DecisionsService, DecisionsRepository],
})
export class DecisionsModule {}
