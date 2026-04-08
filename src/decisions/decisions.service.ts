import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DecisionsRepository } from './decisions.repository';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { DecisionStatus } from '@prisma/client';

@Injectable()
export class DecisionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: DecisionsRepository,
  ) {}

  async create(roomId: string, dto: CreateDecisionDto) {
    return this.repo.create(roomId, dto.title, dto.description, dto.domain, dto.options);
  }

  async findByRoom(roomId: string) {
    return this.repo.findByRoom(roomId);
  }

  async findOne(id: string) {
    const decision = await this.repo.findById(id);
    if (!decision) throw new NotFoundException('Decision not found');
    return decision;
  }

  async close(id: string, userId: string) {
    const decision = await this.findOne(id);
    const room = await this.prisma.room.findUnique({ where: { id: decision.roomId } });
    if (room?.ownerId !== userId) throw new ForbiddenException('Only room owner can close decisions');

    await this.repo.updateStatus(id, { status: DecisionStatus.CLOSED, closedAt: new Date() });
    return this.findOne(id);
  }

  async manualValidate(id: string, winningOptionId: string, userId: string) {
    const decision = await this.findOne(id);
    const room = await this.prisma.room.findUnique({ where: { id: decision.roomId } });
    if (room?.ownerId !== userId) throw new ForbiddenException('Only room owner can validate');

    await this.repo.updateStatus(id, {
      status: DecisionStatus.VALIDATED,
      winningOption: winningOptionId,
    });
    return this.findOne(id);
  }
}
