import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis(
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        );
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis(
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        );
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', 'REDIS_SUBSCRIBER', RedisService],
})
export class RedisModule {}
