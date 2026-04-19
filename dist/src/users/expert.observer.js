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
var ExpertObserver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertObserver = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let ExpertObserver = ExpertObserver_1 = class ExpertObserver {
    prisma;
    logger = new common_1.Logger(ExpertObserver_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    checkIfExpert(user) {
        return (user.reputationScore > 100 &&
            user.accuracyScore > 0.7 &&
            user.votesCount > 50);
    }
    async handleUserScoreUpdated(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        const isExpertEligible = this.checkIfExpert(user);
        if (isExpertEligible &&
            user.role !== client_1.UserRole.EXPERT &&
            user.role !== client_1.UserRole.ADMIN) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { role: client_1.UserRole.EXPERT },
            });
            this.logger.log(`User ${user.id} promoted to EXPERT based on dynamic scores.`);
        }
        else if (!isExpertEligible && user.role === client_1.UserRole.EXPERT) {
            const fallbackRole = user.isInvitedByAdmin
                ? client_1.UserRole.TRUSTED_USER
                : client_1.UserRole.USER;
            await this.prisma.user.update({
                where: { id: user.id },
                data: { role: fallbackRole },
            });
            this.logger.log(`User ${user.id} demoted from EXPERT to ${fallbackRole}.`);
        }
    }
};
exports.ExpertObserver = ExpertObserver;
__decorate([
    (0, event_emitter_1.OnEvent)('user.score.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpertObserver.prototype, "handleUserScoreUpdated", null);
exports.ExpertObserver = ExpertObserver = ExpertObserver_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpertObserver);
//# sourceMappingURL=expert.observer.js.map