"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightModule = void 0;
const common_1 = require("@nestjs/common");
const weight_service_1 = require("./weight.service");
const role_strategy_1 = require("./strategies/role.strategy");
const reputation_strategy_1 = require("./strategies/reputation.strategy");
const trusted_strategy_1 = require("./strategies/trusted.strategy");
const skill_strategy_1 = require("./strategies/skill.strategy");
const participation_strategy_1 = require("./strategies/participation.strategy");
let WeightModule = class WeightModule {
};
exports.WeightModule = WeightModule;
exports.WeightModule = WeightModule = __decorate([
    (0, common_1.Module)({
        providers: [
            weight_service_1.WeightService,
            role_strategy_1.RoleStrategy,
            reputation_strategy_1.ReputationStrategy,
            trusted_strategy_1.TrustedStrategy,
            skill_strategy_1.SkillStrategy,
            participation_strategy_1.ParticipationStrategy,
        ],
        exports: [weight_service_1.WeightService],
    })
], WeightModule);
//# sourceMappingURL=weight.module.js.map