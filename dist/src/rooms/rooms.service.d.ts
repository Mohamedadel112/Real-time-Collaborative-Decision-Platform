import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    create(userId: string, dto: CreateRoomDto): Promise<{
        owner: {
            username: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
            username: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
            username: string;
            id: string;
        };
        members: ({
            user: {
                username: string;
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            roomId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        topic: string | null;
        isPrivate: boolean;
        maxMembers: number;
        ownerId: string;
    }>;
    join(roomId: string, userId: string): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        roomId: string;
    }>;
    leave(roomId: string, userId: string): Promise<void>;
    addPresence(roomId: string, userId: string): Promise<void>;
    removePresence(roomId: string, userId: string): Promise<void>;
    getPresence(roomId: string): Promise<string[]>;
    isUserInRoom(roomId: string, userId: string): Promise<boolean>;
}
