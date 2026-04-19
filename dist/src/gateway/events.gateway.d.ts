import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { WeightService, WeightResult } from '../weight/weight.service';
import { PrismaService } from '../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly redisService;
    private readonly weightService;
    private readonly prisma;
    private readonly eventEmitter;
    server: Server;
    constructor(redisService: RedisService, weightService: WeightService, prisma: PrismaService, eventEmitter: EventEmitter2);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): {
        event: string;
        data: {
            roomId: string;
        };
    };
    handleVote(data: {
        userId: string;
        decisionId: string;
        optionId: string;
    }, client: Socket): Promise<{
        event: string;
        data: {
            message: string;
        };
    } | {
        event: string;
        data: WeightResult;
    }>;
}
