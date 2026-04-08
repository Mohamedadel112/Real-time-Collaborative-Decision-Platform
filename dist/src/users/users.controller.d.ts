import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
        email: string;
        username: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        reputation: number;
        votesCount: number;
        correctVotes: number;
        domainExpertise: string[];
        createdAt: Date;
    }>;
}
