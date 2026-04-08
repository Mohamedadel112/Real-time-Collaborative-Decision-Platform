import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    create(user: any, dto: CreateRoomDto): Promise<{
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
            joinedAt: Date;
            userId: string;
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
    join(id: string, user: any): Promise<{
        id: string;
        joinedAt: Date;
        userId: string;
        roomId: string;
    }>;
    leave(id: string, user: any): Promise<void>;
    getPresence(id: string): Promise<string[]>;
}
