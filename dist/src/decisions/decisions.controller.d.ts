import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
export declare class DecisionsController {
    private readonly decisionsService;
    constructor(decisionsService: DecisionsService);
    create(roomId: string, dto: CreateDecisionDto): Promise<{
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
    findAll(roomId: string): Promise<({
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
    findOne(id: string): Promise<{
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
    }>;
    close(id: string, user: any): Promise<{
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
    }>;
    validate(id: string, body: {
        winningOptionId: string;
    }, user: any): Promise<{
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
    }>;
}
