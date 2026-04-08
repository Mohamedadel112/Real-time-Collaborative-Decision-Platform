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
exports.VotingController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const voting_service_1 = require("./voting.service");
const cast_vote_dto_1 = require("./dto/cast-vote.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let VotingController = class VotingController {
    votingService;
    constructor(votingService) {
        this.votingService = votingService;
    }
    castVote(decisionId, dto, user) {
        return this.votingService.castVote(decisionId, dto.optionId, user.id);
    }
    getVotes(decisionId) {
        return this.votingService.getVotes(decisionId);
    }
};
exports.VotingController = VotingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('decisionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cast_vote_dto_1.CastVoteDto, Object]),
    __metadata("design:returntype", void 0)
], VotingController.prototype, "castVote", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('decisionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VotingController.prototype, "getVotes", null);
exports.VotingController = VotingController = __decorate([
    (0, common_1.Controller)('decisions/:decisionId/votes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [voting_service_1.VotingService])
], VotingController);
//# sourceMappingURL=voting.controller.js.map