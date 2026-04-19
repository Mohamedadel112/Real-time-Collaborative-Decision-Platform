import { VotingService } from './voting.service';
import { CastVoteDto } from './dto/cast-vote.dto';
export declare class VotingController {
    private readonly votingService;
    constructor(votingService: VotingService);
    castVote(decisionId: string, dto: CastVoteDto, user: any): Promise<{
        voteId: string;
        weight: number;
        breakdown: string[];
    }>;
    getVotes(decisionId: string): Promise<({
        user: {
            username: string;
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        weight: number;
        validation: import("@prisma/client").$Enums.VoteValidationStatus;
        decisionId: string;
        optionId: string;
    })[]>;
}
