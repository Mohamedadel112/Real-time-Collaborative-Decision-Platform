import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    create(userId: string, dto: CreateRoomDto): Promise<{
        owner: {
            id: string;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        topic: string | null;
        isPrivate: boolean;
        maxMembers: number;
        ownerId: string;
    }>;
    findAll(): Promise<({
        _count: {
            members: number;
            decisions: number;
        };
        owner: {
            id: string;
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        topic: string | null;
        isPrivate: boolean;
        maxMembers: number;
        ownerId: string;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            decisions: number;
        };
        owner: {
            id: string;
            username: string;
        };
        members: ({
            user: {
                id: string;
                username: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            joinedAt: Date;
            userId: string;
            roomId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        topic: string | null;
        isPrivate: boolean;
        maxMembers: number;
        ownerId: string;
    }>;
    join(roomId: string, userId: string): Promise<{
        id: string;
        joinedAt: Date;
        userId: string;
        roomId: string;
    }>;
    leave(roomId: string, userId: string): Promise<void>;
    addPresence(roomId: string, userId: string): Promise<void>;
    removePresence(roomId: string, userId: string): Promise<void>;
    getPresence(roomId: string): Promise<string[]>;
    isUserInRoom(roomId: string, userId: string): Promise<boolean>;
}
