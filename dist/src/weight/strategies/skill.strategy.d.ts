import { WeightStrategy, WeightContext } from '../interfaces/weight-strategy.interface';
export declare class SkillStrategy implements WeightStrategy {
    calculate(context: WeightContext): number;
}
