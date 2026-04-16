import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
export declare class InviteController {
    private readonly inviteService;
    constructor(inviteService: InviteService);
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
}
