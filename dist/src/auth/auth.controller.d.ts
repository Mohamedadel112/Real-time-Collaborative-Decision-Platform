import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
            reputation: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            role: any;
            reputation: any;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        username: string;
        role: import("@prisma/client").$Enums.UserRole;
        reputationScore: number;
        accuracyScore: number;
        votesCount: number;
        correctVotes: number;
        isInvitedByAdmin: boolean;
    } | null>;
}
