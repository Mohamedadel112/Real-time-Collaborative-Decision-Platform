import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
export declare class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly roomsService;
    server: Server;
    constructor(roomsService: RoomsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, payload: {
        roomId: string;
    }): Promise<{
        event: string;
        roomId: string;
    }>;
    handleLeaveRoom(client: Socket, payload: {
        roomId: string;
    }): Promise<{
        event: string;
        roomId: string;
    }>;
    broadcastToRoom(roomId: string, event: string, data: any): void;
}
