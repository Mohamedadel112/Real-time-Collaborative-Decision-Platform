"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let InviteService = class InviteService {
    prisma;
    redisService;
    emailService;
    constructor(prisma, redisService, emailService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.emailService = emailService;
    }
    async createInvite(adminId, email) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser)
            throw new common_1.ConflictException('User already registered.');
        const rateLimitKey = `invite_rate:${adminId}`;
        const currentCount = await this.redisService.incrementAndGet(rateLimitKey, 3600);
        if (currentCount > 10) {
            throw new common_1.BadRequestException('Rate limit exceeded. Try again later.');
        }
        const openInvites = await this.prisma.invite.count({
            where: { invitedById: adminId, status: 'PENDING' },
        });
        if (openInvites >= 5) {
            throw new common_1.BadRequestException('Open invite quota exceeded (Max 5).');
        }
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
        const invite = await this.prisma.invite.create({
            data: { email, token, expiresAt, invitedById: adminId },
        });
        await this.redisService.setWithExpiry(`token:${token}`, 'VALID', 72 * 3600);
        await this.emailService.sendInviteEmail(email, token);
        return invite;
    }
    async getInvitesByAdmin(adminId) {
        return this.prisma.invite.findMany({
            where: { invitedById: adminId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async acceptInvite(token, userData) {
        const isValid = await this.redisService.get(`token:${token}`);
        if (!isValid) {
            throw new common_1.BadRequestException('Token invalid or expired.');
        }
        const invite = await this.prisma.invite.findUnique({ where: { token } });
        if (!invite ||
            invite.status !== 'PENDING' ||
            invite.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token invalid or expired.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { username: userData.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username already taken.');
        }
        const passwordHash = await bcrypt.hash(userData.password, 12);
        return this.prisma.$transaction(async (tx) => {
            await tx.invite.update({
                where: { id: invite.id },
                data: { status: 'ACCEPTED', acceptedAt: new Date() },
            });
            const user = await tx.user.create({
                data: {
                    email: invite.email,
                    username: userData.username,
                    passwordHash,
                    role: client_1.UserRole.TRUSTED_USER,
                    isInvitedByAdmin: true,
                    invitedById: invite.invitedById,
                },
            });
            await this.redisService.client.del(`token:${token}`);
            return user;
        });
    }
};
exports.InviteService = InviteService;
exports.InviteService = InviteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        email_service_1.EmailService])
], InviteService);
//# sourceMappingURL=invite.service.js.map