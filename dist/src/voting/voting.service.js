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
exports.VotingService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const weight_service_1 = require("../weight/weight.service");
const decisions_repository_1 = require("../decisions/decisions.repository");
const vote_repository_1 = require("./vote.repository");
const client_1 = require("@prisma/client");
let VotingService = class VotingService {
    prisma;
    redis;
    weightService;
    decisionRepo;
    voteRepo;
    eventEmitter;
    constructor(prisma, redis, weightService, decisionRepo, voteRepo, eventEmitter) {
        this.prisma = prisma;
        this.redis = redis;
        this.weightService = weightService;
        this.decisionRepo = decisionRepo;
        this.voteRepo = voteRepo;
        this.eventEmitter = eventEmitter;
    }
    async castVote(decisionId, optionId, userId) {
        const decision = await this.decisionRepo.findById(decisionId);
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        if (decision.status !== client_1.DecisionStatus.OPEN) {
            throw new common_1.BadRequestException('Decision is not open for voting');
        }
        const existing = await this.voteRepo.findByUserAndDecision(userId, decisionId);
        if (existing)
            throw new common_1.ConflictException('Already voted on this decision');
        const lockKey = `vote:${decisionId}:${userId}`;
        const acquired = await this.redis.acquireLock(lockKey, 5000);
        if (!acquired)
            throw new common_1.ConflictException('Vote is being processed, please retry');
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const weight = this.weightService.calculateWeight(user, decision.domain ?? undefined);
            const vote = await this.voteRepo.create({ decisionId, optionId, userId, weight });
            await this.decisionRepo.updateOptionWeight(optionId, weight);
            this.eventEmitter.emit('vote.cast', { decisionId, vote, weight, roomId: decision.roomId });
            return {
                voteId: vote.id,
                weight,
                breakdown: this.weightService.getWeightBreakdown(user, decision.domain ?? undefined),
            };
        }
        finally {
            await this.redis.releaseLock(lockKey);
        }
    }
    async getVotes(decisionId) {
        return this.voteRepo.findByDecision(decisionId);
    }
};
exports.VotingService = VotingService;
exports.VotingService = VotingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        weight_service_1.WeightService,
        decisions_repository_1.DecisionsRepository,
        vote_repository_1.VoteRepository,
        event_emitter_1.EventEmitter2])
], VotingService);
//# sourceMappingURL=voting.service.js.map