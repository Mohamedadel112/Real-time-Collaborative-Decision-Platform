import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { DecisionsModule } from './decisions/decisions.module';
import { VotingModule } from './voting/voting.module';
import { WeightModule } from './weight/weight.module';
import { DecisionEngineModule } from './decision-engine/decision-engine.module';
import { ReputationModule } from './reputation/reputation.module';

@Module({
  imports: [
    // Core
    ConfigModule,
    DatabaseModule,
    RedisModule,
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', global: true }),

    // Feature modules
    AuthModule,
    UsersModule,
    RoomsModule,
    DecisionsModule,
    WeightModule,
    VotingModule,
    DecisionEngineModule,
    ReputationModule,
  ],
})
export class AppModule {}
