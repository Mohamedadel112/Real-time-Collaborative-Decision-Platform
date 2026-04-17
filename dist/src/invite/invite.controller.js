"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const invite_service_1 = require("./invite.service");
const create_invite_dto_1 = require("./dto/create-invite.dto");
const accept_invite_dto_1 = require("./dto/accept-invite.dto");
let InviteController = class InviteController {
    inviteService;
    jwtService;
    constructor(inviteService, jwtService) {
        this.inviteService = inviteService;
        this.jwtService = jwtService;
    }
    async createInvite(req, createInviteDto) {
        const admin = req.user;
        if (admin.role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('Only admins can create invites.');
        }
        return this.inviteService.createInvite(admin.userId || admin.id, createInviteDto.email);
    }
    async getInvites(req) {
        const admin = req.user;
        if (admin.role !== 'ADMIN') {
            throw new common_1.UnauthorizedException('Only admins can view invite history.');
        }
        return this.inviteService.getInvitesByAdmin(admin.userId || admin.id);
    }
    async acceptInvite(dto) {
        const user = await this.inviteService.acceptInvite(dto.token, {
            username: dto.username,
            password: dto.password,
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                reputationScore: user.reputationScore,
            },
        };
    }
};
exports.InviteController = InviteController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_invite_dto_1.CreateInviteDto]),
    __metadata("design:returntype", Promise)
], InviteController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InviteController.prototype, "getInvites", null);
__decorate([
    (0, common_1.Post)('accept'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_invite_dto_1.AcceptInviteDto]),
    __metadata("design:returntype", Promise)
], InviteController.prototype, "acceptInvite", null);
exports.InviteController = InviteController = __decorate([
    (0, common_1.Controller)('admin/invite'),
    __metadata("design:paramtypes", [invite_service_1.InviteService,
        jwt_1.JwtService])
], InviteController);
//# sourceMappingURL=invite.controller.js.map