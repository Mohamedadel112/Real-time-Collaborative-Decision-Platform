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
exports.DecisionsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const decisions_service_1 = require("./decisions.service");
const create_decision_dto_1 = require("./dto/create-decision.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DecisionsController = class DecisionsController {
    decisionsService;
    constructor(decisionsService) {
        this.decisionsService = decisionsService;
    }
    create(roomId, dto) {
        return this.decisionsService.create(roomId, dto);
    }
    findAll(roomId) {
        return this.decisionsService.findByRoom(roomId);
    }
    findOne(id) {
        return this.decisionsService.findOne(id);
    }
    close(id, user) {
        return this.decisionsService.close(id, user.id);
    }
    validate(id, body, user) {
        return this.decisionsService.manualValidate(id, body.winningOptionId, user.id);
    }
};
exports.DecisionsController = DecisionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_decision_dto_1.CreateDecisionDto]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "close", null);
__decorate([
    (0, common_1.Patch)(':id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DecisionsController.prototype, "validate", null);
exports.DecisionsController = DecisionsController = __decorate([
    (0, common_1.Controller)('rooms/:roomId/decisions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [decisions_service_1.DecisionsService])
], DecisionsController);
//# sourceMappingURL=decisions.controller.js.map