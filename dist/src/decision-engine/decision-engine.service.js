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
var DecisionEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngineService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const decisions_repository_1 = require("../decisions/decisions.repository");
const rooms_gateway_1 = require("../rooms/rooms.gateway");
const client_1 = require("@prisma/client");
const CONFIDENCE_VALID = 0.7;
const CONFIDENCE_WEAK = 0.5;
let DecisionEngineService = DecisionEngineService_1 = class DecisionEngineService {
    decisionRepo;
    roomsGateway;
    logger = new common_1.Logger(DecisionEngineService_1.name);
    constructor(decisionRepo, roomsGateway) {
        this.decisionRepo = decisionRepo;
        this.roomsGateway = roomsGateway;
    }
    async handleVoteCast(payload) {
        const { decisionId, roomId } = payload;
        try {
            const decision = await this.decisionRepo.findById(decisionId);
            if (!decision || decision.status !== client_1.DecisionStatus.OPEN)
                return;
            const result = this.calculateResult(decision);
            this.roomsGateway.broadcastToRoom(roomId, 'decision:updated', {
                decisionId,
                options: result.options,
                leading: result.leading,
                confidence: result.confidence,
                status: result.status,
                totalWeight: result.totalWeight,
            });
            this.logger.debug(`Decision ${decisionId} updated – leading: ${result.leading?.label} (${result.confidence.toFixed(2)}% confidence)`);
        }
        catch (err) {
            this.logger.error('Error handling vote.cast event', err);
        }
    }
    calculateResult(decision) {
        const options = decision.options;
        const totalWeight = options.reduce((sum, o) => sum + o.totalWeight, 0);
        const sorted = [...options].sort((a, b) => b.totalWeight - a.totalWeight);
        const leading = sorted[0];
        let confidence = 0;
        let status = 'invalid';
        if (totalWeight > 0) {
            confidence = leading.totalWeight / totalWeight;
            if (confidence >= CONFIDENCE_VALID)
                status = 'valid';
            else if (confidence >= CONFIDENCE_WEAK)
                status = 'weak';
            else
                status = 'invalid';
        }
        return {
            options: sorted.map((o) => ({
                id: o.id,
                label: o.label,
                weight: o.totalWeight,
                percentage: totalWeight > 0 ? (o.totalWeight / totalWeight) * 100 : 0,
            })),
            leading,
            confidence,
            status,
            totalWeight,
        };
    }
};
exports.DecisionEngineService = DecisionEngineService;
__decorate([
    (0, event_emitter_1.OnEvent)('vote.cast', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DecisionEngineService.prototype, "handleVoteCast", null);
exports.DecisionEngineService = DecisionEngineService = DecisionEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [decisions_repository_1.DecisionsRepository,
        rooms_gateway_1.RoomsGateway])
], DecisionEngineService);
//# sourceMappingURL=decision-engine.service.js.map