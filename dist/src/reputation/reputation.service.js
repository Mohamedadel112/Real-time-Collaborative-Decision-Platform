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
var ReputationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const users_repository_1 = require("../users/users.repository");
const promotion_service_1 = require("./promotion.service");
const REPUTATION_CORRECT = 10;
const REPUTATION_INCORRECT = -3;
let ReputationService = ReputationService_1 = class ReputationService {
    usersRepo;
    promotionService;
    logger = new common_1.Logger(ReputationService_1.name);
    constructor(usersRepo, promotionService) {
        this.usersRepo = usersRepo;
        this.promotionService = promotionService;
    }
    async updateForUser(userId, wasCorrect) {
        const delta = wasCorrect ? REPUTATION_CORRECT : REPUTATION_INCORRECT;
        await this.usersRepo.updateReputation(userId, delta);
        await this.usersRepo.incrementVotesCount(userId, wasCorrect);
        await this.promotionService.evaluatePromotion(userId);
        this.logger.debug(`User ${userId} reputation updated by ${delta}`);
    }
    async handleDecisionValidated(payload) {
        const { winningOptionId, votes } = payload;
        for (const vote of votes) {
            const wasCorrect = vote.optionId === winningOptionId;
            await this.updateForUser(vote.userId, wasCorrect);
        }
    }
};
exports.ReputationService = ReputationService;
__decorate([
    (0, event_emitter_1.OnEvent)('decision.validated', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReputationService.prototype, "handleDecisionValidated", null);
exports.ReputationService = ReputationService = ReputationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        promotion_service_1.PromotionService])
], ReputationService);
//# sourceMappingURL=reputation.service.js.map