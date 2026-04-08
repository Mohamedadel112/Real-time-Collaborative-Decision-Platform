import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndDecision(userId: string, decisionId: string) {
    return this.prisma.vote.findUnique({
      where: { decisionId_userId: { decisionId, userId } },
    });
  }

  async create(data: { decisionId: string; optionId: string; userId: string; weight: number }) {
    return this.prisma.vote.create({ data });
  }

  async findByDecision(decisionId: string) {
    return this.prisma.vote.findMany({
      where: { decisionId },
      include: { user: { select: { id: true, username: true, role: true } } },
    });
  }
}
