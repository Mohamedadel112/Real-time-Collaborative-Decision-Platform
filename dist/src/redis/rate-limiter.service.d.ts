import { RedisService } from './redis.service';
export declare class RateLimiterService {
    private readonly redis;
    constructor(redis: RedisService);
    isAllowed(identifier: string, maxRequests: number, windowSeconds: number): Promise<boolean>;
    checkOrThrow(identifier: string, maxRequests: number, windowSeconds: number): Promise<void>;
}
