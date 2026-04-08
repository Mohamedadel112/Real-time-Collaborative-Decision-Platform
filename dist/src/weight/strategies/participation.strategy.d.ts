import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';
export declare class ParticipationStrategy implements WeightStrategy {
    private readonly MAX_BONUS;
    private readonly SCALE;
    calculate(context: WeightContext): number;
}
