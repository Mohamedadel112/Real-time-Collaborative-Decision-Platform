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
exports.DecisionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DecisionsRepository = class DecisionsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(roomId, title, description, domain, optionLabels) {
        return this.prisma.decision.create({
            data: {
                roomId,
                title,
                description,
                domain,
                options: {
                    create: optionLabels.map((label) => ({ label })),
                },
            },
            include: { options: true },
        });
    }
    async findByRoom(roomId) {
        return this.prisma.decision.findMany({
            where: { roomId },
            include: { options: true, _count: { select: { votes: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.decision.findUnique({
            where: { id },
            include: {
                options: { include: { _count: { select: { votes: true } } } },
                room: { select: { id: true, name: true } },
            },
        });
    }
    async updateStatus(id, data) {
        return this.prisma.decision.update({ where: { id }, data });
    }
    async updateOptionWeight(optionId, delta) {
        return this.prisma.decisionOption.update({
            where: { id: optionId },
            data: {
                totalWeight: { increment: delta },
                votesCount: { increment: 1 },
            },
        });
    }
};
exports.DecisionsRepository = DecisionsRepository;
exports.DecisionsRepository = DecisionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DecisionsRepository);
//# sourceMappingURL=decisions.repository.js.map