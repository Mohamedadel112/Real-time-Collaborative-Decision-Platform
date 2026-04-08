import { PrismaService } from '../database/prisma.service';
import { User } from '@prisma/client';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    updateReputation(userId: string, delta: number): Promise<User>;
    incrementVotesCount(userId: string, correct: boolean): Promise<User>;
    updateRole(userId: string, role: any): Promise<User>;
    updateDomainExpertise(userId: string, domains: string[]): Promise<User>;
}
