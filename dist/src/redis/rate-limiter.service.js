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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RateLimiterService = class RateLimiterService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async isAllowed(identifier, maxRequests, windowSeconds) {
        const key = `rate:${identifier}`;
        const count = await this.redis.client.incr(key);
        if (count === 1) {
            await this.redis.client.expire(key, windowSeconds);
        }
        return count <= maxRequests;
    }
    async checkOrThrow(identifier, maxRequests, windowSeconds) {
        const allowed = await this.isAllowed(identifier, maxRequests, windowSeconds);
        if (!allowed) {
            throw new common_1.HttpException('Too many requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map