import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createInvite(adminId: string, email: string) {
    // Check if user is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('User already registered.');

    // Rate Limiting (Redis) - Max 10 invites per hour per admin
    const rateLimitKey = `invite_rate:${adminId}`;
    const currentCount = await this.redisService.incrementAndGet(
      rateLimitKey,
      3600,
    );
    if (currentCount > 10) {
      throw new BadRequestException('Rate limit exceeded. Try again later.');
    }

    // Check Open Quota
    const openInvites = await this.prisma.invite.count({
      where: { invitedById: adminId, status: 'PENDING' },
    });
    if (openInvites >= 5) {
      throw new BadRequestException('Open invite quota exceeded (Max 5).');
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const invite = await this.prisma.invite.create({
      data: { email, token, expiresAt, invitedById: adminId },
    });

    // Cache the invite token in Redis for quick validation
    await this.redisService.setWithExpiry(`token:${token}`, 'VALID', 72 * 3600);

    return invite;
  }

  async getInvitesByAdmin(adminId: string) {
    return this.prisma.invite.findMany({
      where: { invitedById: adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvite(token: string, userData: any) {
    // Quick validation with Redis
    const isValid = await this.redisService.get(`token:${token}`);
    if (!isValid) {
      throw new BadRequestException('Token invalid or expired.');
    }

    const invite = await this.prisma.invite.findUnique({ where: { token } });
    if (
      !invite ||
      invite.status !== 'PENDING' ||
      invite.expiresAt < new Date()
    ) {
      throw new BadRequestException('Token invalid or expired.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      const user = await tx.user.create({
        data: {
          ...userData,
          email: invite.email,
          role: UserRole.TRUSTED_USER, // Or USER with flag
          isInvitedByAdmin: true,
          invitedById: invite.invitedById,
        },
      });

      // Invalidate token
      await this.redisService.client.del(`token:${token}`);

      return user;
    });
  }
}
