import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly authService;
    constructor(config: ConfigService, authService: AuthService);
    validate(payload: any): Promise<{
        email: string;
        username: string;
        id: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        isInvitedByAdmin: boolean;
        invitedById: string | null;
        reputationScore: number;
        accuracyScore: number;
        votesCount: number;
        correctVotes: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
export {};
