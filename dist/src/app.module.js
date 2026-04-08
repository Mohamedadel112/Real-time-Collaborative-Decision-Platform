"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_module_1 = require("./config/config.module");
const database_module_1 = require("./database/database.module");
const redis_module_1 = require("./redis/redis.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const rooms_module_1 = require("./rooms/rooms.module");
const decisions_module_1 = require("./decisions/decisions.module");
const voting_module_1 = require("./voting/voting.module");
const weight_module_1 = require("./weight/weight.module");
const decision_engine_module_1 = require("./decision-engine/decision-engine.module");
const reputation_module_1 = require("./reputation/reputation.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            event_emitter_1.EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', global: true }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            rooms_module_1.RoomsModule,
            decisions_module_1.DecisionsModule,
            weight_module_1.WeightModule,
            voting_module_1.VotingModule,
            decision_engine_module_1.DecisionEngineModule,
            reputation_module_1.ReputationModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map