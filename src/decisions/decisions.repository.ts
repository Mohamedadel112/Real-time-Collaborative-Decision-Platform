import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decision } from '@prisma/client';

@Injectable()
export class DecisionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    roomId: string,
    title: string,
    description: string | undefined,
    domain: string | undefined,
    optionLabels: string[],
  ): Promise<Decision> {
    return this.prisma.decision.create({
      data: {
        roomId,
        title,
        description,
        domain,
        options: {
          create: optionLabels.map((label) => ({ label })),
        },
      },
      include: { options: true },
    });
  }

  async findByRoom(roomId: string) {
    return this.prisma.decision.findMany({
      where: { roomId },
      include: { options: true, _count: { select: { votes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.decision.findUnique({
      where: { id },
      include: {
        options: { include: { _count: { select: { votes: true } } } },
        room: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: string, data: Partial<Decision>) {
    return this.prisma.decision.update({ where: { id }, data });
  }

  async updateOptionWeight(optionId: string, delta: number) {
    return this.prisma.decisionOption.update({
      where: { id: optionId },
      data: {
        totalWeight: { increment: delta },
        votesCount: { increment: 1 },
      },
    });
  }
}
