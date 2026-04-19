import { Module } from '@nestjs/common';
import { WeightService, DefaultWeightStrategy } from './weight.service';

@Module({
  providers: [
    DefaultWeightStrategy,
    {
      provide: WeightService,
      useFactory: (defaultStrategy: DefaultWeightStrategy) => {
        return new WeightService(defaultStrategy);
      },
      inject: [DefaultWeightStrategy],
    },
  ],
  exports: [WeightService],
})
export class WeightModule {}
