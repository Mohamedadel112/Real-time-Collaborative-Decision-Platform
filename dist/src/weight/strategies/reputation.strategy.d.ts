import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';
export declare class ReputationStrategy implements WeightStrategy {
    private readonly MAX_BONUS;
    private readonly SCALE_FACTOR;
    calculate(context: WeightContext): number;
}
