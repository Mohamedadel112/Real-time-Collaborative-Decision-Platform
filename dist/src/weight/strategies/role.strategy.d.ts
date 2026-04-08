import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';
export declare class RoleStrategy implements WeightStrategy {
    calculate(context: WeightContext): number;
}
