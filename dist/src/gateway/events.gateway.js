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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const redis_service_1 = require("../redis/redis.service");
const weight_service_1 = require("../weight/weight.service");
const prisma_service_1 = require("../database/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let EventsGateway = class EventsGateway {
    redisService;
    weightService;
    prisma;
    eventEmitter;
    server;
    constructor(redisService, weightService, prisma, eventEmitter) {
        this.redisService = redisService;
        this.weightService = weightService;
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    afterInit(server) {
        this.redisService.subscribe('room-updates', (message) => {
            if (message.roomId) {
                this.server.to(message.roomId).emit('receiveUpdate', message);
            }
        });
    }
    handleConnection(client) {
    }
    handleDisconnect(client) {
    }
    handleJoinRoom(data, client) {
        client.join(data.roomId);
        return { event: 'joined', data: { roomId: data.roomId } };
    }
    async handleVote(data, client) {
        try {
            const lockKey = `lock:vote:${data.userId}:${data.decisionId}`;
            const lockAcquired = await this.redisService.client.set(lockKey, 'locked', 'EX', 10, 'NX');
            if (!lockAcquired) {
                return { event: 'error', data: { message: 'Vote already processing' } };
            }
            const existingVote = await this.prisma.vote.findUnique({
                where: {
                    decisionId_userId: {
                        decisionId: data.decisionId,
                        userId: data.userId,
                    },
                },
            });
            if (existingVote) {
                await this.redisService.client.del(lockKey);
                return {
                    event: 'error',
                    data: { message: 'User already voted on this decision' },
                };
            }
            const user = await this.prisma.user.findUnique({
                where: { id: data.userId },
                include: { skills: true },
            });
            const decision = await this.prisma.decision.findUnique({
                where: { id: data.decisionId },
            });
            if (!user || !decision) {
                await this.redisService.client.del(lockKey);
                return {
                    event: 'error',
                    data: { message: 'Invalid user or decision' },
                };
            }
            const weightResult = this.weightService.calculateUserWeight(user, decision);
            const vote = await this.prisma.$transaction(async (tx) => {
                const newVote = await tx.vote.create({
                    data: {
                        userId: user.id,
                        decisionId: decision.id,
                        optionId: data.optionId,
                        weight: weightResult.weight,
                        validation: 'PENDING',
                    },
                });
                await tx.decisionOption.update({
                    where: { id: data.optionId },
                    data: {
                        totalWeight: { increment: weightResult.weight },
                        votesCount: { increment: 1 },
                    },
                });
                return newVote;
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { votesCount: { increment: 1 } },
            });
            this.eventEmitter.emit('user.score.updated', user.id);
            const broadcastData = {
                roomId: decision.roomId,
                type: 'NEW_VOTE',
                decisionId: decision.id,
                optionId: data.optionId,
                weight: weightResult.weight,
                explanation: weightResult.explanation,
            };
            await this.redisService.publish('room-updates', broadcastData);
            await this.redisService.client.del(lockKey);
            return { event: 'voteConfirmed', data: weightResult };
        }
        catch (error) {
            console.error(error);
            return { event: 'error', data: { message: 'Failed to process vote' } };
        }
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleVote", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        weight_service_1.WeightService,
        prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map