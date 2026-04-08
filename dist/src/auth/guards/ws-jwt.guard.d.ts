import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export declare class WsJwtGuard implements CanActivate {
    private readonly jwtService;
    private readonly config;
    private readonly prisma;
    constructor(jwtService: JwtService, config: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
