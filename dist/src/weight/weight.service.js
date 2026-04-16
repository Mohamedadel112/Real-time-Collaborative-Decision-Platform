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
exports.WeightService = exports.DefaultWeightStrategy = void 0;
const common_1 = require("@nestjs/common");
let DefaultWeightStrategy = class DefaultWeightStrategy {
    calculate(user, decision) {
        const breakdown = {
            base: 1,
            trusted: 0,
            warmStart: 0,
            skill: 0,
            reputation: 0,
            accuracy: 0,
        };
        if (user.isInvitedByAdmin)
            breakdown.trusted = 2;
        if (user.reputationScore === 0)
            breakdown.warmStart = 1;
        if (decision.domain && user.skills) {
            const hasSkill = user.skills.some((skill) => skill.tag === decision.domain);
            if (hasSkill)
                breakdown.skill = 2;
        }
        breakdown.reputation = parseFloat((user.reputationScore * 0.1).toFixed(2));
        breakdown.accuracy = parseFloat((user.accuracyScore * 0.2).toFixed(2));
        const totalWeight = breakdown.base +
            breakdown.trusted +
            breakdown.warmStart +
            breakdown.skill +
            breakdown.reputation +
            breakdown.accuracy;
        const explanation = [];
        if (breakdown.base > 0)
            explanation.push(`+${breakdown.base} Base`);
        if (breakdown.trusted > 0)
            explanation.push(`+${breakdown.trusted} Trusted User`);
        if (breakdown.warmStart > 0)
            explanation.push(`+${breakdown.warmStart} Warm Start`);
        if (breakdown.skill > 0)
            explanation.push(`+${breakdown.skill} Skill Match`);
        if (breakdown.reputation > 0)
            explanation.push(`+${breakdown.reputation} Reputation`);
        if (breakdown.accuracy > 0)
            explanation.push(`+${breakdown.accuracy} Accuracy`);
        return {
            weight: parseFloat(totalWeight.toFixed(2)),
            explanation,
        };
    }
};
exports.DefaultWeightStrategy = DefaultWeightStrategy;
exports.DefaultWeightStrategy = DefaultWeightStrategy = __decorate([
    (0, common_1.Injectable)()
], DefaultWeightStrategy);
let WeightService = class WeightService {
    strategy;
    constructor(strategy) {
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    calculateUserWeight(user, decision) {
        return this.strategy.calculate(user, decision);
    }
};
exports.WeightService = WeightService;
exports.WeightService = WeightService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DefaultWeightStrategy])
], WeightService);
//# sourceMappingURL=weight.service.js.map