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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightService = void 0;
const common_1 = require("@nestjs/common");
const role_strategy_1 = require("./strategies/role.strategy");
const reputation_strategy_1 = require("./strategies/reputation.strategy");
const trusted_strategy_1 = require("./strategies/trusted.strategy");
const skill_strategy_1 = require("./strategies/skill.strategy");
const participation_strategy_1 = require("./strategies/participation.strategy");
const MAX_TOTAL_WEIGHT = 8.0;
let WeightService = class WeightService {
    roleStrategy;
    reputationStrategy;
    trustedStrategy;
    skillStrategy;
    participationStrategy;
    constructor(roleStrategy, reputationStrategy, trustedStrategy, skillStrategy, participationStrategy) {
        this.roleStrategy = roleStrategy;
        this.reputationStrategy = reputationStrategy;
        this.trustedStrategy = trustedStrategy;
        this.skillStrategy = skillStrategy;
        this.participationStrategy = participationStrategy;
    }
    calculateWeight(user, decisionDomain) {
        const context = { user, decisionDomain };
        const roleWeight = this.roleStrategy.calculate(context);
        const repBonus = this.reputationStrategy.calculate(context);
        const trustedBonus = this.trustedStrategy.calculate(context);
        const skillBonus = this.skillStrategy.calculate(context);
        const partBonus = this.participationStrategy.calculate(context);
        const total = roleWeight + repBonus + trustedBonus + skillBonus + partBonus;
        return Math.min(total, MAX_TOTAL_WEIGHT);
    }
    getWeightBreakdown(user, decisionDomain) {
        const context = { user, decisionDomain };
        return {
            role: this.roleStrategy.calculate(context),
            reputation: this.reputationStrategy.calculate(context),
            trusted: this.trustedStrategy.calculate(context),
            skill: this.skillStrategy.calculate(context),
            participation: this.participationStrategy.calculate(context),
            total: this.calculateWeight(user, decisionDomain),
        };
    }
};
exports.WeightService = WeightService;
exports.WeightService = WeightService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [role_strategy_1.RoleStrategy,
        reputation_strategy_1.ReputationStrategy,
        trusted_strategy_1.TrustedStrategy,
        skill_strategy_1.SkillStrategy,
        participation_strategy_1.ParticipationStrategy])
], WeightService);
//# sourceMappingURL=weight.service.js.map