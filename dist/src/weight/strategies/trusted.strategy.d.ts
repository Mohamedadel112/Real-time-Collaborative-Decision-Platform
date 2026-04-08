import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';
export declare class TrustedStrategy implements WeightStrategy {
    calculate(context: WeightContext): number;
}
