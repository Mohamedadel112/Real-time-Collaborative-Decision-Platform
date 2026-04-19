import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RedisModule } from '../redis/redis.module';
import { WeightModule } from '../weight/weight.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [RedisModule, WeightModule, DatabaseModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
