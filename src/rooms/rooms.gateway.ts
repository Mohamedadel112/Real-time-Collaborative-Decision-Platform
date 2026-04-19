import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'rooms' })
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  async handleConnection(client: Socket) {
    // Auth is done lazily via guard on each message
    client.data.rooms = new Set<string>();
  }

  async handleDisconnect(client: Socket) {
    // Remove from all rooms presence
    for (const roomId of client.data.rooms ?? []) {
      await this.roomsService.removePresence(roomId, client.data.user?.id);
      this.server
        .to(roomId)
        .emit('user:left', { userId: client.data.user?.id, roomId });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const user = client.data.user;
    const { roomId } = payload;

    const isMember = await this.roomsService.isUserInRoom(roomId, user.id);
    if (!isMember) throw new WsException('Not a member of this room');

    client.join(roomId);
    client.data.rooms?.add(roomId);
    await this.roomsService.addPresence(roomId, user.id);

    const presence = await this.roomsService.getPresence(roomId);
    this.server
      .to(roomId)
      .emit('room:presence', { roomId, onlineUsers: presence });
    return { event: 'room:joined', roomId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const user = client.data.user;
    const { roomId } = payload;

    client.leave(roomId);
    client.data.rooms?.delete(roomId);
    await this.roomsService.removePresence(roomId, user.id);

    const presence = await this.roomsService.getPresence(roomId);
    this.server
      .to(roomId)
      .emit('room:presence', { roomId, onlineUsers: presence });
    return { event: 'room:left', roomId };
  }

  // ─── Broadcast helpers (called by other services) ────────────────────────

  broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }
}
