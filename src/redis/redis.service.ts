import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
  ) {}

  onModuleDestroy() {
    this.redisClient.disconnect();
    this.redisSubscriber.disconnect();
  }

  get client(): Redis {
    return this.redisClient;
  }

  get subscriber(): Redis {
    return this.redisSubscriber;
  }

  // Rate limiting (simple fixed-window counter with expiration)
  async incrementAndGet(key: string, expirySeconds: number): Promise<number> {
    const multi = this.redisClient.multi();
    multi.incr(key);
    multi.ttl(key);

    const results = await multi.exec();
    if (!results) throw new Error('Redis transaction failed');

    const [incrResult, ttlResult] = results;
    const count = incrResult[1] as number;
    const currentTtl = ttlResult[1] as number;

    // Set expiration only on the first increment
    if (count === 1 || currentTtl < 0) {
      await this.redisClient.expire(key, expirySeconds);
    }

    return count;
  }

  // Pub/Sub
  async publish(channel: string, message: any) {
    await this.redisClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void) {
    await this.redisSubscriber.subscribe(channel);
    this.redisSubscriber.on('message', (chan, msg) => {
      if (chan === channel) {
        callback(JSON.parse(msg));
      }
    });
  }

  // Caching
  async setWithExpiry(key: string, value: string, expirySeconds: number) {
    await this.redisClient.setex(key, expirySeconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
}
