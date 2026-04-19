import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
        email: string;
        username: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        reputationScore: number;
        accuracyScore: number;
        votesCount: number;
        correctVotes: number;
        createdAt: Date;
        skills: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            tag: string;
            level: number;
        }[];
    }>;
}
