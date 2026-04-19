import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
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

    // Send invite email
    await this.emailService.sendInviteEmail(email, token);

    return invite;
  }

  async getInvitesByAdmin(adminId: string) {
    return this.prisma.invite.findMany({
      where: { invitedById: adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvite(
    token: string,
    userData: { username: string; password: string },
  ) {
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

    // Check if username is taken
    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });
    if (existingUser) {
      throw new ConflictException('Username already taken.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);

    return this.prisma.$transaction(async (tx) => {
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      const user = await tx.user.create({
        data: {
          email: invite.email,
          username: userData.username,
          passwordHash,
          role: UserRole.TRUSTED_USER,
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
