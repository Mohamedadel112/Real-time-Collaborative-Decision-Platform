import { PrismaService } from '../database/prisma.service';
import { Decision } from '@prisma/client';
export declare class DecisionsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(roomId: string, title: string, description: string | undefined, domain: string | undefined, optionLabels: string[]): Promise<Decision>;
    findByRoom(roomId: string): Promise<({
        _count: {
            votes: number;
        };
        options: {
            id: string;
            votesCount: number;
            createdAt: Date;
            description: string | null;
            label: string;
            totalWeight: number;
            decisionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        roomId: string;
        title: string;
        domain: string | null;
        status: import("@prisma/client").$Enums.DecisionStatus;
        confidence: number;
        winningOption: string | null;
        closedAt: Date | null;
    })[]>;
    findById(id: string): Promise<({
        room: {
            name: string;
            id: string;
        };
        options: ({
            _count: {
                votes: number;
            };
        } & {
            id: string;
            votesCount: number;
            createdAt: Date;
            description: string | null;
            label: string;
            totalWeight: number;
            decisionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        roomId: string;
        title: string;
        domain: string | null;
        status: import("@prisma/client").$Enums.DecisionStatus;
        confidence: number;
        winningOption: string | null;
        closedAt: Date | null;
    }) | null>;
    updateStatus(id: string, data: Partial<Decision>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        roomId: string;
        title: string;
        domain: string | null;
        status: import("@prisma/client").$Enums.DecisionStatus;
        confidence: number;
        winningOption: string | null;
        closedAt: Date | null;
    }>;
    updateOptionWeight(optionId: string, delta: number): Promise<{
        id: string;
        votesCount: number;
        createdAt: Date;
        description: string | null;
        label: string;
        totalWeight: number;
        decisionId: string;
    }>;
}
