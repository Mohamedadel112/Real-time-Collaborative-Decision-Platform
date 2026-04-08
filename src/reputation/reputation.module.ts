import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { PromotionService } from './promotion.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ReputationService, PromotionService],
  exports: [ReputationService, PromotionService],
})
export class ReputationModule {}
