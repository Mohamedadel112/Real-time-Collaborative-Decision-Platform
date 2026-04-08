"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationStrategy = void 0;
const common_1 = require("@nestjs/common");
let ParticipationStrategy = class ParticipationStrategy {
    MAX_BONUS = 1.0;
    SCALE = 50;
    calculate(context) {
        const bonus = context.user.votesCount / this.SCALE;
        return Math.min(bonus, this.MAX_BONUS);
    }
};
exports.ParticipationStrategy = ParticipationStrategy;
exports.ParticipationStrategy = ParticipationStrategy = __decorate([
    (0, common_1.Injectable)()
], ParticipationStrategy);
//# sourceMappingURL=participation.strategy.js.map