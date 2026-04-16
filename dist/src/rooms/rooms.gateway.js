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
exports.RoomsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const rooms_service_1 = require("./rooms.service");
const ws_jwt_guard_1 = require("../auth/guards/ws-jwt.guard");
let RoomsGateway = class RoomsGateway {
    roomsService;
    server;
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    async handleConnection(client) {
        client.data.rooms = new Set();
    }
    async handleDisconnect(client) {
        for (const roomId of client.data.rooms ?? []) {
            await this.roomsService.removePresence(roomId, client.data.user?.id);
            this.server
                .to(roomId)
                .emit('user:left', { userId: client.data.user?.id, roomId });
        }
    }
    async handleJoinRoom(client, payload) {
        const user = client.data.user;
        const { roomId } = payload;
        const isMember = await this.roomsService.isUserInRoom(roomId, user.id);
        if (!isMember)
            throw new websockets_1.WsException('Not a member of this room');
        client.join(roomId);
        client.data.rooms?.add(roomId);
        await this.roomsService.addPresence(roomId, user.id);
        const presence = await this.roomsService.getPresence(roomId);
        this.server
            .to(roomId)
            .emit('room:presence', { roomId, onlineUsers: presence });
        return { event: 'room:joined', roomId };
    }
    async handleLeaveRoom(client, payload) {
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
    broadcastToRoom(roomId, event, data) {
        this.server.to(roomId).emit(event, data);
    }
};
exports.RoomsGateway = RoomsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RoomsGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('room:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('room:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomsGateway.prototype, "handleLeaveRoom", null);
exports.RoomsGateway = RoomsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: 'rooms' }),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsGateway);
//# sourceMappingURL=rooms.gateway.js.map