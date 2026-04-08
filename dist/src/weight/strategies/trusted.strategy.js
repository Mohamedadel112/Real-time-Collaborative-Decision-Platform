"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustedStrategy = void 0;
const common_1 = require("@nestjs/common");
let TrustedStrategy = class TrustedStrategy {
    calculate(context) {
        let bonus = 0;
        if (context.user.isInvitedByAdmin)
            bonus += 2;
        if (context.user.votesCount < 5)
            bonus += 0.5;
        return bonus;
    }
};
exports.TrustedStrategy = TrustedStrategy;
exports.TrustedStrategy = TrustedStrategy = __decorate([
    (0, common_1.Injectable)()
], TrustedStrategy);
//# sourceMappingURL=trusted.strategy.js.map