"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationStrategy = void 0;
const common_1 = require("@nestjs/common");
let ReputationStrategy = class ReputationStrategy {
    MAX_BONUS = 2.0;
    SCALE_FACTOR = 200;
    calculate(context) {
        if (context.user.reputation <= 0)
            return 0;
        const bonus = context.user.reputation / this.SCALE_FACTOR;
        return Math.min(bonus, this.MAX_BONUS);
    }
};
exports.ReputationStrategy = ReputationStrategy;
exports.ReputationStrategy = ReputationStrategy = __decorate([
    (0, common_1.Injectable)()
], ReputationStrategy);
//# sourceMappingURL=reputation.strategy.js.map