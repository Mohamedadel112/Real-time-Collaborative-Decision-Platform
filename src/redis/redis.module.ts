import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RateLimiterService } from './rate-limiter.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useFactory: (config: ConfigService) => ({
        host: config.get('app.redis.host'),
        port: config.get('app.redis.port'),
        password: config.get('app.redis.password'),
        db: config.get('app.redis.db'),
      }),
      inject: [ConfigService],
    },
    RedisService,
    RateLimiterService,
  ],
  exports: [RedisService, RateLimiterService],
})
export class RedisModule {}
