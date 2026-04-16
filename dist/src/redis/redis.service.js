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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    redisClient;
    redisSubscriber;
    constructor(redisClient, redisSubscriber) {
        this.redisClient = redisClient;
        this.redisSubscriber = redisSubscriber;
    }
    onModuleDestroy() {
        this.redisClient.disconnect();
        this.redisSubscriber.disconnect();
    }
    get client() {
        return this.redisClient;
    }
    get subscriber() {
        return this.redisSubscriber;
    }
    async incrementAndGet(key, expirySeconds) {
        const multi = this.redisClient.multi();
        multi.incr(key);
        multi.ttl(key);
        const results = await multi.exec();
        if (!results)
            throw new Error('Redis transaction failed');
        const [incrResult, ttlResult] = results;
        const count = incrResult[1];
        const currentTtl = ttlResult[1];
        if (count === 1 || currentTtl < 0) {
            await this.redisClient.expire(key, expirySeconds);
        }
        return count;
    }
    async publish(channel, message) {
        await this.redisClient.publish(channel, JSON.stringify(message));
    }
    async subscribe(channel, callback) {
        await this.redisSubscriber.subscribe(channel);
        this.redisSubscriber.on('message', (chan, msg) => {
            if (chan === channel) {
                callback(JSON.parse(msg));
            }
        });
    }
    async setWithExpiry(key, value, expirySeconds) {
        await this.redisClient.setex(key, expirySeconds, value);
    }
    async get(key) {
        return this.redisClient.get(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __param(1, (0, common_1.Inject)('REDIS_SUBSCRIBER')),
    __metadata("design:paramtypes", [ioredis_1.default,
        ioredis_1.default])
], RedisService);
//# sourceMappingURL=redis.service.js.map