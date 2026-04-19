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
exports.DecisionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const decisions_repository_1 = require("./decisions.repository");
const client_1 = require("@prisma/client");
let DecisionsService = class DecisionsService {
    prisma;
    repo;
    constructor(prisma, repo) {
        this.prisma = prisma;
        this.repo = repo;
    }
    async create(roomId, dto) {
        return this.repo.create(roomId, dto.title, dto.description, dto.domain, dto.options);
    }
    async findByRoom(roomId) {
        return this.repo.findByRoom(roomId);
    }
    async findOne(id) {
        const decision = await this.repo.findById(id);
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        return decision;
    }
    async close(id, userId) {
        const decision = await this.findOne(id);
        const room = await this.prisma.room.findUnique({
            where: { id: decision.roomId },
        });
        if (room?.ownerId !== userId)
            throw new common_1.ForbiddenException('Only room owner can close decisions');
        await this.repo.updateStatus(id, {
            status: client_1.DecisionStatus.CLOSED,
            closedAt: new Date(),
        });
        return this.findOne(id);
    }
    async manualValidate(id, winningOptionId, userId) {
        const decision = await this.findOne(id);
        const room = await this.prisma.room.findUnique({
            where: { id: decision.roomId },
        });
        if (room?.ownerId !== userId)
            throw new common_1.ForbiddenException('Only room owner can validate');
        await this.repo.updateStatus(id, {
            status: client_1.DecisionStatus.VALIDATED,
            winningOption: winningOptionId,
        });
        return this.findOne(id);
    }
};
exports.DecisionsService = DecisionsService;
exports.DecisionsService = DecisionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        decisions_repository_1.DecisionsRepository])
], DecisionsService);
//# sourceMappingURL=decisions.service.js.map