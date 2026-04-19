import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputationScore: true,
        accuracyScore: true,
        votesCount: true,
        correctVotes: true,
        skills: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAccuracyRate(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { votesCount: true, correctVotes: true },
    });
    if (!user || user.votesCount === 0) return 0;
    return (user.correctVotes / user.votesCount) * 100;
  }
}
