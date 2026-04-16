import { OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly redisClient;
    private readonly redisSubscriber;
    constructor(redisClient: Redis, redisSubscriber: Redis);
    onModuleDestroy(): void;
    get client(): Redis;
    get subscriber(): Redis;
    incrementAndGet(key: string, expirySeconds: number): Promise<number>;
    publish(channel: string, message: any): Promise<void>;
    subscribe(channel: string, callback: (message: any) => void): Promise<void>;
    setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void>;
    get(key: string): Promise<string | null>;
}
