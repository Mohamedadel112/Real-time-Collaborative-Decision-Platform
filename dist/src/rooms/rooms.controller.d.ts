import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    create(user: any, dto: CreateRoomDto): Promise<{
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
    join(id: string, user: any): Promise<{
        id: string;
        joinedAt: Date;
        userId: string;
        roomId: string;
    }>;
    leave(id: string, user: any): Promise<void>;
    getPresence(id: string): Promise<string[]>;
}
