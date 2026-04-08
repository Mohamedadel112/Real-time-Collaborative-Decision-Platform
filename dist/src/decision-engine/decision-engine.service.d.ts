import { DecisionsRepository } from '../decisions/decisions.repository';
import { RoomsGateway } from '../rooms/rooms.gateway';
export declare class DecisionEngineService {
    private readonly decisionRepo;
    private readonly roomsGateway;
    private readonly logger;
    constructor(decisionRepo: DecisionsRepository, roomsGateway: RoomsGateway);
    handleVoteCast(payload: {
        decisionId: string;
        vote: any;
        weight: number;
        roomId: string;
    }): Promise<void>;
    calculateResult(decision: any): {
        options: {
            id: string;
            label: string;
            weight: number;
            percentage: number;
        }[];
        leading: {
            id: string;
            label: string;
            totalWeight: number;
        };
        confidence: number;
        status: "valid" | "weak" | "invalid";
        totalWeight: number;
    };
}
