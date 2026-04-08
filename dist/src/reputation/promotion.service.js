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
var PromotionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const users_repository_1 = require("../users/users.repository");
const client_1 = require("@prisma/client");
const EXPERT_REPUTATION_THRESHOLD = 100;
const EXPERT_ACCURACY_THRESHOLD = 70;
const EXPERT_VOTES_THRESHOLD = 50;
let PromotionService = PromotionService_1 = class PromotionService {
    prisma;
    usersRepo;
    logger = new common_1.Logger(PromotionService_1.name);
    constructor(prisma, usersRepo) {
        this.prisma = prisma;
        this.usersRepo = usersRepo;
    }
    async evaluatePromotion(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        if (user.role === client_1.UserRole.ADMIN)
            return;
        const accuracy = user.votesCount > 0 ? (user.correctVotes / user.votesCount) * 100 : 0;
        const qualifiesForExpert = user.reputation >= EXPERT_REPUTATION_THRESHOLD &&
            accuracy >= EXPERT_ACCURACY_THRESHOLD &&
            user.votesCount >= EXPERT_VOTES_THRESHOLD;
        if (qualifiesForExpert && user.role !== client_1.UserRole.EXPERT) {
            await this.usersRepo.updateRole(userId, client_1.UserRole.EXPERT);
            this.logger.log(`🎖️  User ${user.username} promoted to EXPERT`);
        }
        else if (!qualifiesForExpert && user.role === client_1.UserRole.EXPERT) {
            await this.usersRepo.updateRole(userId, client_1.UserRole.USER);
            this.logger.log(`📉 User ${user.username} demoted from EXPERT`);
        }
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = PromotionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_repository_1.UsersRepository])
], PromotionService);
//# sourceMappingURL=promotion.service.js.map