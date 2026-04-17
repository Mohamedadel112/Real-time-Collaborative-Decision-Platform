import { JwtService } from '@nestjs/jwt';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
export declare class InviteController {
    private readonly inviteService;
    private readonly jwtService;
    constructor(inviteService: InviteService, jwtService: JwtService);
    createInvite(req: any, createInviteDto: CreateInviteDto): Promise<{
        email: string;
        id: string;
        invitedById: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }>;
    getInvites(req: any): Promise<{
        email: string;
        id: string;
        invitedById: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        token: string;
        expiresAt: Date;
        acceptedAt: Date | null;
    }[]>;
    acceptInvite(dto: AcceptInviteDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            username: string;
            role: import("@prisma/client").$Enums.UserRole;
            reputationScore: number;
        };
    }>;
}
