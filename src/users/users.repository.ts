import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateReputation(userId: string, delta: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { reputationScore: { increment: delta } },
    });
  }

  async incrementVotesCount(userId: string, correct: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        votesCount: { increment: 1 },
        correctVotes: correct ? { increment: 1 } : undefined,
      },
    });
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  // async updateDomainExpertise(userId: string, domains: string[]): Promise<User> {
  //   return this.prisma.user.update({ where: { id: userId }, data: { domainExpertise: domains } });
  // }
}
