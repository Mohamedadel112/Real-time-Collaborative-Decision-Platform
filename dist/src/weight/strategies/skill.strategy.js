"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillStrategy = void 0;
const common_1 = require("@nestjs/common");
let SkillStrategy = class SkillStrategy {
    calculate(context) {
        if (!context.decisionDomain)
            return 0;
        const hasMatch = context.user.domainExpertise.includes(context.decisionDomain);
        return hasMatch ? 1.5 : 0;
    }
};
exports.SkillStrategy = SkillStrategy;
exports.SkillStrategy = SkillStrategy = __decorate([
    (0, common_1.Injectable)()
], SkillStrategy);
//# sourceMappingURL=skill.strategy.js.map