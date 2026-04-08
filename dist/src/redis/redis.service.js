"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    options;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    subscriber;
    publisher;
    constructor(options) {
        this.options = options;
    }
    async onModuleInit() {
        this.client = new ioredis_1.default(this.options);
        this.subscriber = new ioredis_1.default(this.options);
        this.publisher = new ioredis_1.default(this.options);
        this.client.on('connect', () => this.logger.log('✅ Redis client connected'));
        this.client.on('error', (err) => this.logger.error('Redis error', err));
    }
    async onModuleDestroy() {
        await this.client.quit();
        await this.subscriber.quit();
        await this.publisher.quit();
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async hset(key, field, value) {
        await this.client.hset(key, field, value);
    }
    async hget(key, field) {
        return this.client.hget(key, field);
    }
    async hgetall(key) {
        return this.client.hgetall(key);
    }
    async hdel(key, field) {
        await this.client.hdel(key, field);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async incrby(key, amount) {
        return this.client.incrby(key, amount);
    }
    async expire(key, seconds) {
        await this.client.expire(key, seconds);
    }
    async acquireLock(key, ttlMs) {
        const lockKey = `lock:${key}`;
        const result = await this.client.set(lockKey, '1', 'PX', ttlMs, 'NX');
        return result === 'OK';
    }
    async releaseLock(key) {
        await this.client.del(`lock:${key}`);
    }
    async publish(channel, message) {
        await this.publisher.publish(channel, message);
    }
    async subscribe(channel, callback) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel)
                callback(msg);
        });
    }
    async sadd(key, ...members) {
        await this.client.sadd(key, ...members);
    }
    async srem(key, ...members) {
        await this.client.srem(key, ...members);
    }
    async smembers(key) {
        return this.client.smembers(key);
    }
    async scard(key) {
        return this.client.scard(key);
    }
    async sismember(key, member) {
        const result = await this.client.sismember(key, member);
        return result === 1;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map