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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const ROOM_PRESENCE_PREFIX = 'room:presence:';
let RoomsService = class RoomsService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async create(userId, dto) {
        return this.prisma.room.create({
            data: {
                name: dto.name,
                description: dto.description,
                topic: dto.topic,
                isPrivate: dto.isPrivate ?? false,
                maxMembers: dto.maxMembers ?? 100,
                ownerId: userId,
                members: { create: { userId } },
            },
            include: { owner: { select: { id: true, username: true } } },
        });
    }
    async findAll() {
        return this.prisma.room.findMany({
            where: { isPrivate: false },
            include: {
                owner: { select: { id: true, username: true } },
                _count: { select: { members: true, decisions: true } },
            },
        });
    }
    async findOne(id) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, username: true } },
                members: { include: { user: { select: { id: true, username: true, role: true } } } },
                _count: { select: { decisions: true } },
            },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async join(roomId, userId) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { _count: { select: { members: true } } },
        });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room._count.members >= room.maxMembers) {
            throw new common_1.BadRequestException('Room is full');
        }
        return this.prisma.roomMember.upsert({
            where: { roomId_userId: { roomId, userId } },
            create: { roomId, userId },
            update: {},
        });
    }
    async leave(roomId, userId) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.ownerId === userId)
            throw new common_1.ForbiddenException('Owner cannot leave the room');
        await this.prisma.roomMember.delete({
            where: { roomId_userId: { roomId, userId } },
        });
    }
    async addPresence(roomId, userId) {
        await this.redis.sadd(`${ROOM_PRESENCE_PREFIX}${roomId}`, userId);
    }
    async removePresence(roomId, userId) {
        await this.redis.srem(`${ROOM_PRESENCE_PREFIX}${roomId}`, userId);
    }
    async getPresence(roomId) {
        return this.redis.smembers(`${ROOM_PRESENCE_PREFIX}${roomId}`);
    }
    async isUserInRoom(roomId, userId) {
        return this.prisma.roomMember
            .findUnique({ where: { roomId_userId: { roomId, userId } } })
            .then((m) => !!m);
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map