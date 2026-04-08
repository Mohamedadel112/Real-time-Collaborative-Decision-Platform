import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimiterService {
  constructor(private readonly redis: RedisService) {}

  /**
   * Token bucket rate limiter using Redis.
   * Returns true if request is allowed, false if rate limit exceeded.
   */
  async isAllowed(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const key = `rate:${identifier}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }
    return count <= maxRequests;
  }

  async checkOrThrow(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<void> {
    const allowed = await this.isAllowed(identifier, maxRequests, windowSeconds);
    if (!allowed) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
