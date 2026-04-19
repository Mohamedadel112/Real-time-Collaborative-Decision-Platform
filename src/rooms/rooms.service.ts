import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateRoomDto } from './dto/create-room.dto';

const ROOM_PRESENCE_PREFIX = 'room:presence:';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: string, dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: dto.name,
        description: dto.description,
        topic: dto.topic,
        isPrivate: dto.isPrivate ?? false,
        maxMembers: dto.maxMembers ?? 100,
        ownerId: userId,
        members: { create: { userId } }, // owner joins automatically
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

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, username: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
        },
        _count: { select: { decisions: true } },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async join(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { _count: { select: { members: true } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room._count.members >= room.maxMembers) {
      throw new BadRequestException('Room is full');
    }

    return this.prisma.roomMember.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId },
      update: {},
    });
  }

  async leave(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.ownerId === userId)
      throw new ForbiddenException('Owner cannot leave the room');

    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });
  }

  // ─── Presence Tracking (Redis) ────────────────────────────────────────────

  async addPresence(roomId: string, userId: string): Promise<void> {
    await this.redis.client.sadd(`${ROOM_PRESENCE_PREFIX}${roomId}`, userId);
  }

  async removePresence(roomId: string, userId: string): Promise<void> {
    await this.redis.client.srem(`${ROOM_PRESENCE_PREFIX}${roomId}`, userId);
  }

  async getPresence(roomId: string): Promise<string[]> {
    return this.redis.client.smembers(`${ROOM_PRESENCE_PREFIX}${roomId}`);
  }

  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    return this.prisma.roomMember
      .findUnique({ where: { roomId_userId: { roomId, userId } } })
      .then((m) => !!m);
  }
}
